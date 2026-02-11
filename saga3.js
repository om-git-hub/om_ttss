function saga3Transform(text){

  // 1) .--  -> space
  text = text.replace(/\.--/g, " ");

  // 2) Remove all dots
  text = text.replace(/\./g, "");

  // 3) V--C  ->  V-VC-C
  // C = single consonant OR double consonant
  text = text.replace(
    /([aeiou])--(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])/gi,
    "$1-$1$2-$2"
  );

  // 4) C--C  ->  C-C
  text = text.replace(
    /(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])--(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])/gi,
    "$1*-$2"
  );

  // 5) CVC  ->  CV-VC
  text = text.replace(
    /(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])([aeiou])(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])/gi,
    "$1$2-$2$3"
  );

  // 6) CVVC  ->  CVV-VC
  text = text.replace(
    /(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])([aeiou])([aeiou])(ch|dh|ny|ph|ts|sh|zy|[bcdfghjklmnpqrstvwxyz'])/gi,
    "$1$2$3-$3$4"
  );

  return text;
};