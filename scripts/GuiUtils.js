'use strict';

const get = (id) => {
  const elt = document.getElementById(id);
  if (elt == null) {
    throw new Error('elt is null:' + id);
  }
  return elt;
};

const setValue = (id, value) => {
  get(id).value = value;
};

const getValue = (id) => {
  return get(id).value;
};

const setChecked = (id, status) => {
  get(id).checked = status;
};

const getChecked = (id) => {
  return get(id).checked;
};

const setPlaceholder = (id, value) => {
  get(id).placeholder = value;
};

const getPlaceholder = (id) => {
  return get(id).placeholder;
};

const hide = (id) => {
  get(id).style = 'display:none;';
};

const show = (id) => {
  get(id).style = 'display:default;';
};

exports.get = get;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setChecked = setChecked;
exports.getChecked = getChecked;
exports.setPlaceholder = setPlaceholder;
exports.getPlaceholder = getPlaceholder;
exports.hide = hide;
exports.show = show;
