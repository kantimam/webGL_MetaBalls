export default`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_scrollVal;
uniform sampler2D u_tex;
uniform sampler2D u_image0;
uniform sampler2D u_image1;



vec2 mirrored(vec2 vecIn) {
  vec2 mod = mod(vecIn, 2.0);
  return mix(mod, 2.0 - mod, step(1.0, mod));
}


float texTransition(vec2 pos, float limit, float delay){

  float posDistance=limit-((pos.x+pos.y)/(2.0+2.0*delay));
  //float posDistance=limit-((pos.x*pos.y)/(1.0+delay));


  if(posDistance<=0.0){
    return 0.0;
  }
  if(posDistance>delay){
    return 1.0;
  }
  if(posDistance>0.0){
    return /* abs(posDistance/delay) */ (posDistance/delay)*(posDistance/delay);
  }
}


void main() {

  /* modifiers how much the textures get moved on scroll. keep it at integers */
  vec2 texOneMod=vec2(3.0,2.0);
  vec2 texTwoMod=vec2(2.0,-3.0);
  

  vec2 mirrorTexCoordOne=mirrored(vec2(v_texCoord.x+(u_scrollVal*texOneMod.x),v_texCoord.y+(u_scrollVal*texOneMod.y)));
  vec2 mirrorTexCoordTwo=mirrored(vec2(v_texCoord.x+(u_scrollVal*texTwoMod.x),v_texCoord.y+(u_scrollVal*texTwoMod.y)));

  vec4 color0 = texture2D(u_image0, mirrorTexCoordOne);
  vec4 color1 = texture2D(u_image1, mirrorTexCoordTwo);


  gl_FragColor = mix(color0, color1, texTransition(v_texCoord, u_scrollVal, 0.2));



}
`