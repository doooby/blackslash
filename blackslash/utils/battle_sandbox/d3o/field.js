import * as THREE from 'three';
import constants from '../constants';

export default class Field {

    constructor (battleground, index, type) {
        this.bg = battleground;
        this.index = index;
        this.sprite = null;

    }

    getMaterial () {

    }

}

Field.types = [

    'gravel_yellow'

];