import preact from 'preact';
import utils from '../../utils';

export default class NumberInput extends preact.Component {

    constructor (props) {
        super(props);

        this.state.text = props.value;
        this.state.valid = is_valid_number(props.value);
        this.handleChange = this.handleChange.bind(this);

        if (props.onChange) props.onChange = utils.debounce(props.onChange, 500)
    }

    render (props, {text, valid}) {
        return <input
            type="text"
            className={utils.css('form-control form-control-sm', props.className, (valid ? null : '_invalid'))}
            placeholder={props.placeholder}
            value={text}
            onInput={this.handleChange}/>;
    }

    handleChange (e) {
        const valid = is_valid_number(e.target.value);

        this.setState({text: e.target.value, valid});
        if (valid && this.props.onChange) this.props.onChange(Number(e.target.value));
    }

}

function is_valid_number (value) {
    const number = Number(value);
    return value !== '' && !isNaN(number);
}