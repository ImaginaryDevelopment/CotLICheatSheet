// include Fake lib
#r @"packages/FAKE/tools/FakeLib.dll"
open System
open System.Diagnostics
open System.IO
open Fake

let flip f y x = f x y
let warn msg = trace (sprintf "WARNING: %s" msg)

type System.String with
    static member Delimit delimiter (items:string seq) =
        String.Join(delimiter,items |> Array.ofSeq)

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

Target "Coffee" (fun _ ->
    let coffees = [
        "test/test.coffee"
    ]
    let compileCoffee relPath =
        let result,_ = Proc.runWithOutput "node" (sprintf "node_modules/coffee-script/bin/coffee -b -m --no-header -c %s" relPath) (TimeSpan.FromSeconds 2.)
        if result.ExitCode <> 0 then
            failwithf "Task failed: %A" result
    coffees
    |> Seq.iter compileCoffee
)