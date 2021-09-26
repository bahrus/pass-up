const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/fly-u.html',
            expectedNoOfSuccessMarkers: 2,
        },
        {
            path: 'test/xtal-editor/dev.html',
            expectedNoOfSuccessMarkers: 1
        }
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();

