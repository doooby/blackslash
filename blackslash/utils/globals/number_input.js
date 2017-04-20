import preact from 'preact';
import classnames from 'classnames';

export default class NumberInput extends preact.Component {

    constructor (props) {
        super(props);

        this.state.text = props.value;
        this.handleChange = this.handleChange.bind(this);
    }

    render (props, {text, valid}) {
        return <input
            type="text"
            className={classnames(props.className, (valid ? null : '_invalid'))}
            placeholder={props.placeholder}
            value={text}
            onInput={this.handleChange}/>;
    }

    handleChange (e) {
        const number = Number(e.target.value);
        const valid = e.target.value && !isNaN(number);

        this.setState({text: e.target.value, valid});
        if (valid && this.props.onChange) this.props.onChange(number);
    }

}