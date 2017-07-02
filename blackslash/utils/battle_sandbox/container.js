import preact from 'preact';
// import AnimForm from './anim_form';

export default class Container extends preact.Component {

    render ({sceneSize}) {
        return <div
            id="bsu-battle-sandbox"
            style={`width: ${sceneSize[0]}px;`}>

            <div
                className="ui">
            </div>

            <div
                ref={el => this.scene_container = el}
                className="scene"
                style={`height: ${sceneSize[1]}px;`}/>
        </div>;
    }

    componentDidMount () {
        this.props.onMounted();
    }

}