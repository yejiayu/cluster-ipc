'use strict';

const obj = {
  send(id) {
    setTimeout(() => {
      const id2 = id;
      console.log(id);
    }, 2000);
  },
};
