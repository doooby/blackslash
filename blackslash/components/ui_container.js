import preact from 'preact';

export default class UiContainer extends preact.Component {

    render () {
        return <div>
            <input type="file" onChange={this.tryReadImage.bind(this)}/>
            <button>

            </button>
        </div>;
    }

    tryReadImage (e) {
        const component = this;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (read_event) {
            if (read_event.target.readyState === 2 || read_event.target.status === 0) {
                const image = new Image();
                image.src = read_event.target.result;
                component.props.onChange('IMG', image);
            }
        };
        reader.readAsDataURL(file);
    }

}