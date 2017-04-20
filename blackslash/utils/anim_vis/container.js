

export default class Container {

    render ({sceneSize}) {return <div id="bsu-anim-vis" style={`width: ${sceneSize[0]}px;`}>

        <div>
            <button>Click</button>
        </div>

        <div ref={el => this.scene_container=el}
            style={`width: 100%; height: ${sceneSize[1]}px;`} />
    </div>;}

    componentDidMount () {
        this.props.onMounted();
    }

}