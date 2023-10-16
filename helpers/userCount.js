export const userCount = (content) => {
  const userArray = [];
  //push in array if more than 1 user only
  if (Array.isArray(content)) {
    content.forEach(function (value, index, arr) {
      userArray.push(value);
    });
    var endLength = userArray.length;
    console.log(endLength, "lennn");
  }
  //condition when only 1 user
  else if (content) {
    endLength = 1;
    console.log(endLength, "lennn");
  }
  // when 0 user in cc and bcc
  else {
    endLength = 0;
  }
  console.log(endLength, "endlengthh");
  return endLength;
};


