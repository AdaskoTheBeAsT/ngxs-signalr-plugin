xcopy .\LICENSE .\dist\libs\ngxs-signalr-plugin\ /Y
xcopy .\README.md .\dist\libs\ngxs-signalr-plugin\ /Y
cd dist/libs/ngxs-signalr-plugin
npm publish --tag=latest --access public
