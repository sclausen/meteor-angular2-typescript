var ts = Npm.require('typescript');

Plugin.registerSourceHandler('ts', function(compileStep) {
  ngTs = !!compileStep.inputPath.match(new RegExp(/.ng.ts$/i));
  dTs = !!compileStep.inputPath.match(new RegExp(/.d.ts$/i));
  if (dTs) {
    return true;
  }

  var output,
    moduleName,
    diagnostics = [],
    sourceCode = compileStep.read().toString('utf8'),
    fileName = compileStep.pathForSourceMap;

  if (ngTs === true) {
    output = ts.transpile(sourceCode, {
      module: ts.ModuleKind.System,
      emitDecoratorMetadata: true,
      experimentalDecorators: true
    }, fileName, diagnostics);
    moduleName = compileStep.inputPath.replace(/\\/g, '/').replace('.ng', '').replace('.ts', '');
    output = output.replace("System.register([", 'System.register("' + moduleName + '",[');
  } else {
    output = ts.transpile(sourceCode, {
      emitDecoratorMetadata: true,
      experimentalDecorators: true
    }, fileName, diagnostics);
  }

  if (diagnostics.length) {
    var errorMessage = "";
    diagnostics.forEach(function(d) {
      errorMessage += compileStep.inputPath + " TS" + d.code + " " + d.messageText + "\n";
    });
    console.error(errorMessage + "\n");
  }

  compileStep.addJavaScript({
    path: compileStep.inputPath.replace('.ng', '').replace('.ts', '.js'),
    data: output,
    sourcePath: compileStep.inputPath
  });
});
