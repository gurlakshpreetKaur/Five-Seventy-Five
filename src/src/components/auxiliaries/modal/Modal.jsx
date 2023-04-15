import React from "react";
import "./Modal.css";
import "../../General.css";

class Modal extends React.Component {
    constructor(props) {
        super();
    }

    documentHandleScroll = scroll => (scroll.target.className.includes("scroll-div")) && this.props.setShow(false);

    documentHandleClick = click =>
        (click.target !== this.props.passingRef.current) && (!this.props.passingRef.current.contains(click.target))
        && this.props.setShow(false);

    componentDidMount() {
        document.addEventListener('scroll', this.documentHandleScroll, true);
        document.addEventListener('click', this.documentHandleClick, true);
    }

    render() {
        return (
            <div className={"modal " + (this.props.className ?? "")} ref={this.props.passingRef} >
                {this.props.children}
            </div>);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.documentHandleScroll, true);
        document.removeEventListener('click', this.documentHandleClick, true);
    }
}

export default Modal;