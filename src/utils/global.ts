
//
interface XGlobal {
    storageL:Storage;
    storageS:Storage;
    data?:any;

    init: Function;
};

const G:XGlobal = {
    storageL:localStorage,
    storageS:sessionStorage,
    data: undefined,
    init: function() {
        this.data && this.data.init();
    }
};

//
export default G;