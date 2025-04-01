import Cookies from 'js-cookie';

export const setCookie = (name, value) => {
  Cookies.set(name, value);
};

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const removeCookie = (name) => {
  Cookies.remove(name);
};