
chrome.runtime.onConnect.addListener(function (port) {
    function onResponse( sourceId ) {
        if(!sourceId || !sourceId.length) {
            port.postMessage('PermissionDeniedError');
        } else {
            port.postMessage({ sourceId: sourceId,
            type:'onResponseReqSouId'});
        }
    }

    function onMessage( msg ) {

        if( msg === 'test' ) {
            port.postMessage({result:'ok',
            type:'testMessage'});;
        }
        if( msg !== 'requestScreenSourceId' ) {
            return;
        }
        chrome.desktopCapture.chooseDesktopMedia(
            ['screen', 'window'],
            port.sender.tab,
            onResponse
        );
    }

    port.onMessage.addListener(onMessage );
});
