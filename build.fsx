// include Fake lib
// printfn "Trying %s" System.Environment.CurrentDirectory
#r @"packages/FAKE/tools/FakeLib.dll"
#r @"packages/FAKE/tools/Newtonsoft.Json.dll"

open System
open System.Diagnostics
open System.IO
open System.Text.RegularExpressions
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
    static member ContainsI delimiter (x:string) =
        x.IndexOf(delimiter, StringComparison.InvariantCultureIgnoreCase) >= 0
module Seq =
    open System.Collections
    // cast one by one, return result only if all items were sucessful
    // not setup for efficiently handling a large number of items
    // result will be reversed if built efficiently?
    let tryCast<'T> (items: IEnumerable) =
        items
        |> Seq.cast<obj>
        |> Seq.fold (fun castedItems nextItem ->
            match castedItems with
            | Some items ->
                match nextItem with
                | :? 'T as t ->
                    Some (t :: items)
                | _ ->
                    None
            | None -> None


        ) (Some List.Empty)
        |> Option.map (List.ofSeq>> List.rev)
()

[<AutoOpen>]
module JsonHelpers =
    open Newtonsoft.Json
    open Newtonsoft.Json.Linq
    let (|NoJ|JValue|JObject|JArray|) (jt:JToken) =
        // let (|NoJ|JV|JOb|JArr|JT|) jt =
        match jt with
        | null -> NoJ
        | :? JValue as jv -> JValue jv
        | :? JObject as jo -> JObject jo
        | :? JArray as ja -> JArray ja
        // should this ever happen?
        | x -> failwithf "Unexpected type of JToken %s" (jt.GetType().Name)

    let (|JValueArray|_|) (jt:JToken) =
        match jt with
        | JArray jv ->
            match jv |> Array.ofSeq |> Seq.tryCast<JValue> with
            | Some values -> Some values
            | _ -> None
        | _ -> None
    let (|JObjArray|_|) (jt:JToken) =
        match jt with
        | JArray jv ->
            jv |> Array.ofSeq |> Seq.tryCast<JObject>
        | _ -> None
    let getStr (name:string) (jo:JObject) = jo.[name] |> string
    let getPropertyNames (jo:JObject) = jo.Properties() |> Seq.map (fun p -> p.Name) |> List.ofSeq
    let getProperty (name:string) (jo:JObject) : JProperty option = jo.Property name |> Option.ofObj
    let getPropertyValue name jo :JToken option = getProperty name jo |> Option.map (fun jp -> jp.Value) |> Option.bind Option.ofObj
    let getPropertyValueJType name jo = getPropertyValue name jo |> Option.map (fun jv -> jv.GetType())
    let getArray name jo = getProperty name jo |> Option.map (fun jp -> jp.Value |> fun x -> x :?> JArray)
    let getArrayT<'T> name jo = getArray name jo |> Option.map (Seq.cast<'T>)

    let deserializeJO x = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(x)
    let hasProperty (name:string) (jo:JObject) = jo.Property(name) |> isNull |> not
    let setProperty (name:string) (value:obj) jo =
        let t = JToken.FromObject value
        if jo |> hasProperty name then
            // would be nice if this took objects and camelcased them
            jo.Property(name).Value <- t
        else
            //printfn "adding new property %s" name
            jo.Add(name,t)
()

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

type WatchItParams = {Files:FileIncludes; FRunOnce: FileChange seq option -> unit; RunImmediately:bool }
// setup watcher and return disposable to close it
let watchIt wip =
    let watcher = wip.Files |> WatchChanges (fun changes ->
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
()

module Proc =
    //let execCmd prog args timeout =
    type PrintResultOptions = {ErrorForeColor:ConsoleColor; ProblemRegex: Regex option}

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
                f.FileName <- cmd
                f.Arguments <- args
            ) (TimeSpan.FromMinutes 1.0)
        result,cmd

    let printVerboseResult errorForeColorOpt titling afterHeaderOpt (result:ProcessResult) =
        let cbColor = Console.BackgroundColor
        let cfColor = Console.ForegroundColor
        try
            let printAndHeaderIfAny isErrors subheader items =
                match items |> List.ofSeq with
                | [] -> ()
                | items ->
                    printfn "  %s: " subheader
                    match isErrors,errorForeColorOpt with
                    | false, Some {ErrorForeColor = errColor; ProblemRegex=Some r} ->
                        items
                        |> Seq.iter(fun msg ->
                            if r.IsMatch(msg) then
                                Console.ForegroundColor <- errColor
                                printfn "    %s" msg
                                Console.ForegroundColor <- cfColor
                            else
                                printfn "    %s" msg
                        )

                    | true,Some c ->
                        Console.ForegroundColor <- c.ErrorForeColor
                        items |> List.iter(printfn "    %s")
                    | _ ->
                        printfn "  %s: " subheader
                        items |> List.iter(printfn "    %s")
            printAndHeaderIfAny false "Messages" result.Messages
            printAndHeaderIfAny true "Errors" result.Errors
        finally
            Console.BackgroundColor <- cbColor
            Console.ForegroundColor <- cfColor
        printfn "%s: ExitCode:0" titling
        afterHeaderOpt
        |> Option.iter(fun msg ->
            printfn "  %s" msg
        )

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
()

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
()

module Tasks =
    open Newtonsoft.Json.Linq
    type JsonConvert = Newtonsoft.Json.JsonConvert

    // fix for global and module having multiple meanings, depending on if this is browser, or node code
    let fixupNodeTypes () =
        let path = "node_modules/@types/node/index.d.ts"
        File.ReadAllText path
        |> replace "declare var global: NodeJS.Global;" "declare var global: NodeJS.Global | any;"
        |> replace "declare var module: NodeModule;" "declare var module: NodeModule | any;"
        |> fun text -> File.WriteAllText(path, text)

    let compileTS failForExitCode = fun (changes:FileChange seq option) ->
        let changes = changes |> Option.map List.ofSeq
        let fixupDTsFiles () =
            let dtsPath = "node_modules/@types/node/index.d.ts"
            dtsPath
            |> File.ReadAllText
            |> replace "declare var global: NodeJS.Global;" "declare var global: NodeJS.Global | any;"
            |> replace "declare var module: NodeModule;" "declare var module: NodeModule | any;"
            |> fun text -> File.WriteAllText(dtsPath,text)
        fixupDTsFiles()
        let compileTS (relPath:string) =
            let configArgs =
                match changes with
                | None -> List.empty
                // we're going to compile individual files, it will ignore the tsconfig.json, and there is no option to tell it to use that.
                //  which is incredibly dump and infuriating
                | Some changes  when File.Exists("tsconfig.json") ->
                    let text = File.ReadAllText("tsconfig.json")
                    let jo = JsonConvert.DeserializeObject<JObject>(text)
                    let result =
                        match jo |> getPropertyValue "compilerOptions" with
                        | None
                        | Some null -> List.empty
                        | Some co ->
                            let jo = co :?> JObject
                            jo
                            |> getPropertyNames
                            |> Seq.collect (fun e ->
                                let v =
                                    jo
                                    |> getPropertyValue e
                                    |> function
                                        | Some (:? JValue as jv) -> Some (box jv.Value)
                                        | None -> None
                                        | Some x -> failwithf "unexpected type for jv.Value %s" (x.GetType().Name)
                                let isTrue =
                                    match v with
                                    | Some( :? string as e) -> e ="true"
                                    | Some( :? bool as b) -> b
                                    | x ->
                                        warn <| sprintf "unexpected propertyValue Type %s %A" (x.GetType().Name) x
                                        false
                                let getString() = (v |> Option.map (fun v -> v :?> string) |> Option.get)

                                [
                                    match e with
                                    | "outDir" ->
                                        // should this worry about spaces in the provided value/path?
                                        yield sprintf "--outDir %s" (getString())
                                    | "sourceMap" -> if isTrue then yield "--sourceMap"
                                    | "strictNullChecks" -> if isTrue then yield "--strictNullChecks"
                                    | "module" -> yield sprintf "-m %s" (getString())
                                    | "jsx" -> yield sprintf "--jsx %s" (getString())
                                    | "target" -> yield sprintf "-t %s" (getString())
                                    | "allowJs" -> if isTrue then yield "--allowJs"
                                    | "declaration" -> if isTrue then yield "-d"
                                    | "declarationDir" -> yield sprintf "--declarationDir %s" (getString())
                                    | x -> warn <| sprintf "tsconfigOption not matched: %s" x
                                ]
                            )
                            |> List.ofSeq
                    result

                | _ ->
                    warn <| sprintf "no tsconfig.json found in %s for single files transpilation" Environment.CurrentDirectory
                    List.empty
            ()

            let cmd,args = "node_modules/.bin/tsc.cmd",  relPath::"--listEmittedFiles"::configArgs |> Seq.filter(String.IsNullOrWhiteSpace >> not) |> String.Delimit " "
            let fullText = sprintf "%s %s" cmd args
            trace fullText
            let result,_ = Proc.runWithOutput cmd args (TimeSpan.FromSeconds 3.)
            Proc.printVerboseResult (Some {ErrorForeColor=ConsoleColor.Red; ProblemRegex=Regex("error") |> Some}) "TypeScript" (Some fullText) result
            if failForExitCode && result.ExitCode <> 0 then
                failwithf "Task failed: %i" result.ExitCode
        match changes with
        | None | Some [] -> compileTS null
        | Some changes ->
            changes
            |> Seq.map (fun fi -> fi.FullPath)
            |> Seq.iter compileTS
        printfn ""

    let makeCoffee = fun _ ->
        let coffeeGlob = !! "src/**/*.coffee" ++ "test/**/*.coffee"

        let compileCoffee relPath =
            trace <| sprintf "CompileCoffee:%s" relPath
            let generateMaps = relPath |> String.ContainsI "test" |> not
            let ``top-level function wrapper`` = false
            let suppressGeneratedByHeader = true
            let args = [
                yield "node_modules/coffee-script/bin/coffee"
                if not ``top-level function wrapper`` then yield "-b"
                if generateMaps then yield "-m"
                if suppressGeneratedByHeader then yield "--no-header"
                yield "-c"
                yield relPath
            ]
            let cmd, args = "node", args |> String.Delimit " "
            let fullText = sprintf "%s %s" cmd args
            let result,_ = Proc.runWithOutput cmd args (TimeSpan.FromSeconds 2.)
            Proc.printVerboseResult (Some {ErrorForeColor= ConsoleColor.Red; ProblemRegex=None}) "Coffee" (Some fullText) result
            if result.ExitCode <> 0 then
                failwithf "Task failed: %i" result.ExitCode

        coffeeGlob
        |> Seq.iter compileCoffee

    let test fOnError = fun _ ->
        let cmd,args = "npm", "test"
        let fullText = sprintf "%s %s" cmd args
        let result, _ = Proc.runWithOutput cmd args (TimeSpan.FromSeconds 4.)
        Proc.printVerboseResult (Some {ErrorForeColor= ConsoleColor.Red; ProblemRegex=Regex("\d\)|\w+Error:") |> Some}) "Tests" (Some fullText) result
        if result.ExitCode <> 0 then
            // result.Errors
            // |> Seq.iter(printfn "test-err:%s")
            fOnError result
            // failwithf "Task failed: %i" result.ExitCode
        ()
()

Target "Test" (Tasks.test (fun r -> failwithf "Task failed: %i" r.ExitCode))

Target "Coffee" (Tasks.makeCoffee)

Target "Tsc" (fun _ -> Tasks.compileTS true None)

// Targets
Target "Watch" (fun _ ->
    let tsWatch = !! "src/**/*.tsx?" ++ "test/**/*.tsx?" -- "**/*.d.ts"
    tsWatch |> String.Delimit ";"
    |> sprintf "tsWatch:%s"
    |> trace
    watchAllTheThings [
        // type WatchItParams = {Files:string; FRunOnce: FileChange seq option -> unit; RunImmediately:bool }
            {Files= tsWatch;FRunOnce = (fun changesOpt -> Tasks.compileTS false (changesOpt)); RunImmediately = true}
            {Files =  !! "test/**/*.coffee";FRunOnce = (fun _changesOpt -> Tasks.makeCoffee()); RunImmediately = true}
            {   Files = !! "test/**/*.js"; FRunOnce = Tasks.test(fun r ->
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

// this runs npm install to download packages listed in package.json
For "Test" ["SetupNode";"Coffee"]
Target "Default" (fun _ ->
    trace "Hello World from FAKE"
)

RunTargetOrDefault "Default"