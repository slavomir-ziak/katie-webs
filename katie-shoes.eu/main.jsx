'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const portfolio = require('./data/portfolio.json');
import Swipeable from 'react-swipeable'

const GalleryPicture = function (props) {
	return <div className="gallery-image" >
		<img src={props.image} alt={props.alt} />
        <a href={props.image}> {props.alt} </a>
    </div>;
}

const page = 4;
class Gallery extends React.Component {
	constructor(props) {
		super(props);
		this.state = {index: 0};
	}
	next() {
		this.setState({index: this.state.index + page});
	}
	prev() {
		this.setState({index: this.state.index - page})
	}
	openOveralay() {
		this.setState({overlay: true})
	}
	render() {
		return <div className="container-fluid">
			<div className="row">{
				this.props.pictures
					.slice(this.state.index, this.state.index + page)
					.map(pic => 
						<div className="col-xs-6 col-sm-3 ks-gallery-col-12" onClick={() => this.openOveralay()} key={pic.image}>
							<GalleryPicture 
								
								image={pic.image}
								localization={pic.localization}
								alt={pic.alt}
								text='text' 
							/>
						</div>
					)
			}</div>
			<button type="button" className="btn btn-default" onClick={() => this.prev()}>Prev page</button>
			<button type="button" className="btn btn-default" onClick={() => this.next()}>Next page</button>
			{this.state.overlay ? <Carousel pictures={this.props.pictures} /> : null }
		</div>;
	}
}

class Carousel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {index: 0};
	}
	next() {
		this.setState({index: this.state.index + 1});
	}
	prev() {
		this.setState({index: this.state.index - 1})
	}

	render() {

		return <div className="ks-overlay">
	      <Swipeable
	        onSwipedRight={() => this.prev()}
	        onSwipedLeft={() => this.next()}
	        style={{touchAction: 'none' }}
	        className="ks-container"
	        trackMouse
	        preventDefaultTouchmoveEvent >
		        <img src={this.props.pictures[this.state.index].image} className="ks-image"></img>
				<div className="ks-image-overlay"></div>
				<div className="ks-test__prev" onClick={() => this.prev()}></div>
				<div className="ks-test__next" onClick={() => this.next()}></div>
	      </Swipeable>
		</div>;
	}
};

ReactDOM.render(
  	<Gallery pictures={portfolio}/>,
  	document.getElementById('container')
);
