import preact from 'preact';

export default class FileInput extends preact.Component {

    constructor (props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    render (props, {text}) {
        return <div>

            <input
                type="file"
                name={props.name}
                ref={el => this.file_input = el}
                style="width: 0; visibility: hidden;"
                onChange={this.handleChange}
                accept={props.accept}
            />

            <input
                type="text"
                className={props.className}
                placeholder={props.placeholder}
                readOnly="readOnly"
                value={text}
                onClick={this.handleClick}/>

        </div>;
    }

    handleChange (e) {
        this.setState({text: e.target.value.split(/[\\\/]/g).pop()});
        if (this.props.onChange) this.props.onChange(e.target.files[0]);
    }

    handleClick () {
        if (this.file_input) this.file_input.click();
    }

}