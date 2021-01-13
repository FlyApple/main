
//
const _instanceList:Map<string,any> = new Map<string, any>();

//
export class SingletonBase {

    protected _clazzTypeName:string = "";
    public get clazzTypeName() { return this._clazzTypeName; }

    constructor() {
        this._clazzTypeName =  this.constructor.name;
    }
}

export class Singleton<_T extends SingletonBase> extends SingletonBase {
    
    constructor() {
        super();
        
        //
        if(_instanceList.has(this._clazzTypeName)) {
            throw new Error(`${this.clazzTypeName} Singleton is setting.`);
            return ;
        }
        _instanceList.set(this._clazzTypeName, this);
    }
}

export function getSingleton<_TT>(clazzType:new() => _TT) : _TT {
    let inst:any = _instanceList.get(clazzType.name);
    if(!inst) {
        inst = new clazzType();
    }
    return inst as _TT;
}