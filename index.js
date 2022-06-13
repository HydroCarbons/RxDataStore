//------------------------------------------------------------------------------
export const updateObj = (obj, path, value) => {
 let delimiter = ".";
 path.split(delimiter)
  .slice(0,-1)
  .reduce( (obj, key) => obj[key] || (obj[key] = {}), obj)[path.split(delimiter).pop()] = value;
}
//------------------------------------------------------------------------------
export const deleteObj = (obj, path, value) => {
 let delimiter = ".";
 delete path.split(delimiter)
  .slice(0,-1)
  .reduce( (obj, key) => obj[key] || (obj[key] = {}), obj)[path.split(delimiter).pop()];
}
//------------------------------------------------------------------------------
export const getObj = (obj, path) => {
  try {
    let property = path.split(".");
    for(let i=0;i<property.length; i++) {
      let next = property[i];
      obj = obj[next];
    }
  }
  catch(e) {
    console.log("Error in retrieving object property", e);
    return { error: e };
  }
  return obj;
}
//------------------------------------------------------------------------------
export class RxDataStore {
  constructor(init_value={}, type="async") {
    this.__type = type;
    this.store = init_value;
    this.subscribers = {};
  }

  // Unique app_id and callback function
  subscribe(app_id, fn) {
    if(!app_id) return;
    if(!this.subscribers[app_id]) this.subscribers[app_id] = fn;
  }

  // Unique app_id, dot notation path to observe stored object for changes and a callback function
  subscribePath(app_id, path, fn) {
    if(!app_id) return;
    if(!this.subscribers[app_id]) {
      this.subscribers[app_id] = this.__subscribePath.bind(this, app_id, path, fn);
    }
  }

  __subscribePath(app_id, path, fn, dataObject) {
    if( dataObject.action==="set" ||
        (dataObject.action==="delete" && path.indexOf(dataObject.path)===0) ||
        dataObject.path === path ) {
      fn && fn(dataObject);
      return;
    }
  }

  // Unique app_id
  unsubscribe(app_id) {
    if(!app_id) return;
    if(this.subscribers[app_id]) delete this.subscribers[app_id];
  }

  // Reset or set the stored object to a new value
  set(new_value={}) {
    this.store = new_value;
    this.__broadcast("set", "", this.store);
  }

  // Get the value of stored object
  get(){
    return this.store;
  }

  // Get the value of stored object at the dot notation path
  getPath(path) {
    if(typeof path === 'undefined') return this.store;
    return getObj(this.store, path);
  }

  __broadcast(action="update", path, value) {
    let handler = () => {
      Object.keys(this.subscribers).map( (subscriberID, index)=> {
        this.subscribers[subscriberID]({
          action : action,
          data   : this.store,
          path   : path,
          value  : value
        });
      });
    }

    if(this.__type === "async") {
      setTimeout(handler);
    }
    else if(this.__type === "instant") {
      handler();
    }
  }

  // Update the value of stored object at the dot notation path
  update(path, value) {
    let new_store = {...this.store};
    updateObj(new_store, path, value);
    this.store = { ...new_store };
    this.__broadcast("update", path, value);
  }

  // Delete the value of stored object at the dot notation path
  delete(path) {
    let new_store = {...this.store};
    deleteObj(new_store, path);
    this.store = { ...new_store };
    this.__broadcast("delete", path);
  }

  // Toggle the value of stored object at the dot notation path within
  // the specified set of values
  cycle(path, toggleBetween=[true, false]) {
    let new_store = {...this.store};
    let existing_value = getObj(this.store, path);
    let current_index = 0, next_index;
    for(let i=0; i<toggleBetween.length; i++) {
      if(existing_value === toggleBetween[i]) {
        current_index = i;
      }
    }
    next_index = (current_index + 1) % toggleBetween.length;
    this.update(path, toggleBetween[next_index]);
  }

}
//------------------------------------------------------------------------------
