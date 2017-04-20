import preact from 'preact';
import FileInput from '../globals/file_input';
import NumberInput from '../globals/number_input';

export default class AnimForm extends preact.Component {

    constructor (props) {
        super(props);

        this.animation = {
            image: null,
            frame_size: [8, 8],
            length: 8
        };
    }

    render () {
        return <div>
            <FileInput
                accept=".png"
                onChange={value => this.onFileSelected(value)}/>
            <br/>

            frame width:
            <NumberInput
                value={this.animation.frame_size[0]}
                onChange={value => this.onFrameSizeChanged(0, value)}/>
            <br/>

            frame height:
            <NumberInput
                value={this.animation.frame_size[1]}
                onChange={value => this.onFrameSizeChanged(1, value)}/>
            <br/>

            animation length:
            <NumberInput
                value={this.animation.length}
                onChange={value => this.onLengthChanged(value)}/>
            <br/>

        </div>;
    }

    onFileSelected (file) {
        if (this.file_reader) this.file_reader.abort();

        const reader = new FileReader();
        this.file_reader = reader;
        this.file_reader.onload = e => {
            if (this.file_reader !== reader) return;

            if (e.target.readyState === 2) {
                this.file_reader = null;

                const image = new Image();
                image.src = e.target.result;
                this.onImageLoaded(image);
            }
        };

        reader.readAsDataURL(file);
    }

    onImageLoaded (image) {
        this.animation.image = image;
        this.handleChange();
    }

    onFrameSizeChanged (dimension, value) {
        this.animation.frame_size[dimension] = value;
        this.handleChange();
    }

    onLengthChanged (value) {
        this.animation.length = value;
        this.handleChange();
    }

    handleChange () {
        if (this.props.onChange) this.props.onChange(this.animation);
    }

}