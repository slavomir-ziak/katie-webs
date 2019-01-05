'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageLoader from 'react-imageloader';

function preloader() {
    return <img src="spinner.gif" />;
}

ReactDOM.render(
    <ImageLoader
        src="1_casopis_nevesta.png"
        wrapper={React.DOM.div}
        preloader={preloader}>
        Image load failed!
    </ImageLoader>, document.getElementById('reactAppRoot')
);
