// include Fake lib
// printfn "Trying %s" System.Environment.CurrentDirectory
#r @"packages/FAKE/tools/FakeLib.dll"
open System
open System.Diagnostics
open System.IO
open Fake

let buildDir = "./bin/"
let flip f y x = f x y
let warn msg = trace (sprintf "WARNING: %s" msg)
let (|EndsWithI|_|) (s:string) (x:string) =
    match x with
    | null | "" -> None
    | x when x.EndsWith(s, StringComparison.InvariantCultureIgnoreCase) ->
        Some ()
    | _ -> None


type System.String with
    static member Delimit delimiter (items:string seq) =
        String.Join(delimiter,items |> Array.ofSeq)
module Disposable =
    let fromf f =
        {new IDisposable with
            member __.Dispose() =
                f()
        }
    let add (x:IDisposable) (y:IDisposable) =
        fromf (fun () ->
            try
                x.Dispose()
            finally
                y.Dispose()
        )

type WatchItParams = {Files:string; FRunOnce: FileChange seq option -> unit; RunImmediately:bool }
// setup watcher and return disposable to close it
let watchIt wip =
    let inc = !! wip.Files
    let watcher = inc |> WatchChanges (fun changes ->
        tracefn "%A" changes
        wip.FRunOnce (Some changes)
    )
    if wip.RunImmediately then
        wip.FRunOnce None

    watcher

// watch just one thing, and wait for input
let watchItMr wip =
    use watcher = watchIt wip
    System.Console.Write("Press enter key to stop watching...")
    System.Console.ReadLine() |> ignore // keep fake from exiting
    watcher.Dispose()
let watchAllTheThings items =
    let flushAfterWatching =
        items
        |> List.map watchIt
    System.Console.Write("Press enter key to stop watching...")
    System.Console.ReadLine() |> ignore // keep fake from exiting
    flushAfterWatching
    |> List.iter(fun toFlush ->
        try
            toFlush.Dispose()
        with ex ->
            tracefn "watch disposable failure : %s" ex.Message
    )

module Proc =
    //let execCmd prog args timeout =

    let findCmd cmd =
        let processResult =
            ExecProcessAndReturnMessages (fun psi ->
                psi.FileName <- "where"
                psi.Arguments <- quoteIfNeeded cmd
            ) (TimeSpan.FromSeconds 2.)
        if processResult.OK then
            // require the result not be a directory
            let cmdPath =
                processResult.Messages
                |> Seq.filter (Directory.Exists >> not)
                |> Seq.filter (File.Exists)
                |> Seq.filter (fun x -> x.EndsWith ".bat" || x.EndsWith ".exe" || x.EndsWith ".cmd")
                |> Seq.tryHead
            if processResult.Messages.Count > 1 then
                warn (sprintf "found multiple items matching '%s'" cmd)
                trace (processResult.Messages |> String.Delimit ";")
            match cmdPath with
            | Some path ->
                trace (sprintf "found %s at %s" cmd path)
                Some path
            | None ->
                warn "where didn't return a valid file"
                None
        else None

    let runWithOutput cmd args timeOut =
        let cmd =
            // consider: what if the cmd is in the current dir? where may find one elsewhere first?
            if Path.IsPathRooted cmd then
                cmd
            else
                match findCmd cmd with
                | Some x -> x
                | None ->
                    warn (sprintf "findCmd didn't find %s" cmd)
                    cmd
        let result =
            ExecProcessAndReturnMessages (fun f ->
            //ExecProcessRedirected (fun f ->
                //f.FileName <- @"gulp"
                //f. Arguments <- "sass"
                // why did 'where' with no full path work, but this fails?
                f.FileName <- cmd
                f.Arguments <- args
            ) (TimeSpan.FromMinutes 1.0)
        result,cmd
    let printVerboseResult titling afterHeaderOpt (result:ProcessResult) =
        let printAndHeaderIfAny subheader items =
            match items |> List.ofSeq with
            | [] -> ()
            | items ->
                printfn "  %s: " subheader
                items |> List.iter(printfn "    %s")
        printfn "%s: ExitCode:0" titling
        afterHeaderOpt
        |> Option.iter(fun msg ->
            printfn "  %s" msg
        )
        printAndHeaderIfAny "Messages" result.Messages
        printAndHeaderIfAny "Errors" result.Errors
    let showInExplorer path =
        Process.Start("explorer.exe",sprintf "/select, \"%s\"" path)
    // wrapper for fake built-in in case we want the entire process results, not just the exitcode
    let runElevated cmd args timeOut =
        let tempFilePath = System.IO.Path.GetTempFileName()
        // could also redirect error stream with 2> tempErrorFilePath
        // see also http://www.robvanderwoude.com/battech_redirection.php
        let resultCode = ExecProcessElevated "cmd" (sprintf "/c %s %s > %s" cmd args tempFilePath) timeOut
        trace "reading output results of runElevated"
        let outputResults = File.ReadAllLines tempFilePath
        File.Delete tempFilePath
        let processResult = ProcessResult.New resultCode (ResizeArray<_> outputResults) (ResizeArray<_>())
        (String.Delimit "\r\n" outputResults)
        |> trace
        processResult

    type FindOrInstallResult =
        |Found
        |InstalledThenFound

    let findOrInstall cmd fInstall =
        match findCmd cmd with
        | Some x -> Some (x,Found)
        | None ->
            fInstall()
            findCmd cmd
            |> Option.map (fun x -> (x,InstalledThenFound))

module Node =


    let npmPath = lazy(Proc.findCmd "npm")

    // assumes the output is unimportant, just the result code
    // aka npm install
    let npmInstall args =
        let resultCode =
            let filename, useShell =
                match npmPath.Value with
                | Some x -> x, false
                // can't capture output with true
                | None -> "npm", true
            trace (sprintf "npm filename is %s" filename)
            ExecProcess (fun psi ->
                psi.FileName <- filename
                psi.Arguments <-
                    match args with
                    | null | "" -> "install"
                    | x -> sprintf "install %s" args
                psi.UseShellExecute <- useShell
            ) (TimeSpan.FromMinutes 1.)
        resultCode

module Tasks =
    let babelOn5 () =
        // run jsx compilation
        let babels = [
            "src/eptracker.jsx"
            "src/talentcalc.jsx"
            "src/needsBabel.js"
        ]
        let getJsDir path =
            Path.GetDirectoryName path
            |> fun x -> Path.Combine(x, "js")
        let babel relPath =
            let targetPath =
                let fullPath = Path.GetFullPath relPath
                match fullPath with
                |EndsWithI ".jsx" ->
                    ".react.js"
                | x -> Path.GetExtension x
                |> sprintf "%s%s" (fullPath |> Path.GetFileNameWithoutExtension)
                |> fun x ->
                    let destination = Path.Combine(fullPath |> Path.GetDirectoryName |> getJsDir, x)
                    printfn "destination:%s" destination
                    destination
            let result,_ = Proc.runWithOutput "node" (sprintf "node_modules/babel-cli/bin/babel %s -o %s -s --presets react" relPath targetPath) (TimeSpan.FromSeconds 2.)
            if result.ExitCode <> 0 then
                result.Messages
                |> Seq.iter (printfn "babel-msg:%s")
                result.Errors
                |> Seq.iter(printfn "babel-err:%s")
                failwithf "Task failed: %i" result.ExitCode
            else
                result.Messages
                |> Seq.iter (printfn "babel-msg:%s")
        babels
        |> Seq.iter babel

    let makeCoffee = fun _ ->
        let coffees = [
            "test/eptracker.jsx.tests.coffee"
            // "test/allHelpers.tests.coffee"
        ]
        let compileCoffee relPath =
            let cmd, args = "node", sprintf "node_modules/coffee-script/bin/coffee -b -m --no-header -c %s" relPath
            let fullText = sprintf "%s %s" cmd args
            let result,_ = Proc.runWithOutput cmd args (TimeSpan.FromSeconds 2.)
            Proc.printVerboseResult "Coffee" (Some fullText) result
            if result.ExitCode <> 0 then
                failwithf "Task failed: %i" result.ExitCode
        coffees
        |> Seq.iter compileCoffee
    let test fOnError = fun _ ->
        let result, _ = Proc.runWithOutput "npm" "test" (TimeSpan.FromSeconds 4.)
        result.Messages
        |> Seq.iter (printfn "test-msg:%s")
        if result.ExitCode <> 0 then
            result.Errors
            |> Seq.iter(printfn "test-err:%s")
            fOnError result
            // failwithf "Task failed: %i" result.ExitCode
        ()

Target "Test" (Tasks.test (fun r -> failwithf "Task failed: %i" r.ExitCode))
Target "Coffee" (Tasks.makeCoffee)
// Targets
Target "Watch" (fun _ ->
    watchAllTheThings [
        // type WatchItParams = {Files:string; FRunOnce: FileChange seq option -> unit; RunImmediately:bool }
            {Files =  "src/**/*.jsx";FRunOnce = (fun _changesOpt -> Tasks.babelOn5()); RunImmediately = true}
            {Files =  "test/**/*.coffee";FRunOnce = (fun _changesOpt -> Tasks.makeCoffee()); RunImmediately = true}
            {   Files ="test/**/*.js"; FRunOnce = Tasks.test(fun r ->
                        Console.Error.WriteLine(sprintf "Tests failed with %i" r.ExitCode) |> ignore
                    )
                RunImmediately = true
            }
    ]
    ()

)
//this also installs things that are listed in package.json
Target "SetupNode" (fun _ ->
    // goal: install and setup everything required for any node dependencies this project has
    // including nodejs

    // install Choco
    let chocoPath =
        let fInstall () =
            let resultCode =
                ExecProcessElevated
                    "@powershell"
                    """-NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin" """
                    (TimeSpan.FromMinutes 3.)
            resultCode
            |> sprintf "choco install script returned %i"
            |> trace
            if resultCode <> 0 then
                failwithf "Task failed"
            // choco is installled, we think
            // probably won't work if it was just installed, the %path% variable given to/used by a process is immutable

        match Proc.findOrInstall "choco" fInstall with
        //| Some (x,Proc.FindOrInstallResult.Found) -> x
        | Some (x,_) -> x
        | None -> failwithf "choco was installed, in order for choco to be found or used, this has process has to be restarted"

    // choco install nodeJs
    let nodePath =
        let fInstall () =
            let results = Proc.runElevated "choco" "install nodejs -y" (TimeSpan.FromSeconds 3.)
            trace (sprintf "%A" results)
        match Proc.findOrInstall "node" fInstall with
        | Some (x,_) -> x
        | None -> failwithf "nodejs was installed, in order for node to be found or used, this process has to be restarted"
    // node should have installed npm
    // npm
    let npmPath = Proc.findCmd "npm"
    // install all packages that packages.json says this project needs
    let resultCode =
        let filename, useShell =
            match npmPath with
            | Some x -> x, false
            // can't capture output with true
            | None -> "npm", true
        trace (sprintf "npm filename is %s" filename)
        ExecProcess (fun psi ->
            psi.FileName <- filename
            psi.Arguments <- "install"
            psi.UseShellExecute <- useShell
            ) (TimeSpan.FromMinutes 1.)
    printfn "finished result Code is %A" resultCode
    trace (sprintf "finished result Code is %A" resultCode)
    ()
)
Target "NpmRestore" (fun _ ->
    Node.npmInstall null
    |> ignore
)

Target "Babel" (fun _ ->
    // run jsx compilation
    let babels = [
        "src/eptracker.jsx"
        "src/talentcalc.jsx"
        "src/needsBabel.js"
    ]
    let getJsDir path =
        Path.GetDirectoryName path
        |> fun x -> Path.Combine(x, "js")
    let babel relPath =
        let targetPath =
            let fullPath = Path.GetFullPath relPath
            match fullPath with
            |EndsWithI ".jsx" ->
                ".react.js"
            | x -> Path.GetExtension x
            |> sprintf "%s%s" (fullPath |> Path.GetFileNameWithoutExtension)
            |> fun x ->
                let destination = Path.Combine(fullPath |> Path.GetDirectoryName |> getJsDir, x)
                printfn "destination:%s" destination
                destination
        let result,_ = Proc.runWithOutput "node" (sprintf "node_modules/babel-cli/bin/babel %s -o %s -s --presets react" relPath targetPath) (TimeSpan.FromSeconds 2.)
        if result.ExitCode <> 0 then
            result.Messages
            |> Seq.iter (printfn "babel-msg:%s")
            result.Errors
            |> Seq.iter(printfn "babel-err:%s")
            failwithf "Task failed: %i" result.ExitCode
        else
            result.Messages
            |> Seq.iter (printfn "babel-msg:%s")
    babels
    |> Seq.iter babel
)

// this runs npm install to download packages listed in package.json
For "Babel" ["SetupNode"]
For "Test" ["Babel";"Coffee"]
Target "Default" (fun _ ->
    trace "Hello World from FAKE"
)

RunTargetOrDefault "Default"