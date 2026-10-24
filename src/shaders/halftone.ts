export const vertexShader = `varying vec2 vUv;
void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const fragmentShader = `varying vec2 vUv;
uniform float uOpacity;
void main(){
  vec2 p = fract(vUv * vec2(70.,92.))-.5;
  float dots = 1.-smoothstep(.14,.20,length(p));
  float edge = smoothstep(.5,.1,distance(vUv,vec2(.5)));
  gl_FragColor=vec4(vec3(.52,.32,1.),dots*edge*uOpacity*.45);
}`;
