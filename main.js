import Orb from './Orb.js';

window.onload = function () {
    this.document.title = "loaded"

    const glCanvas = this.document.getElementById("glCanvas");
    const glContext = glCanvas.getContext("webgl");

    setCanvasSize(glCanvas);

    let fragShader = this.document.getElementById("fragShader").innerHTML;
    const vertShader = this.document.getElementById("vertShader").innerHTML;

    const orbArray=randomOrbArray(4, glCanvas.width, glCanvas.height);

    // expose orbarray to the window 
    window.orbArray=orbArray;

    /* fix placeholder inside fragShader */
    /* 2 vector3 fields needed to store all the needed orbdata */
    fragShader=setDynamicLength(fragShader, orbArray.length)


    render(glContext, vertShader, fragShader, orbArray);


}

const recoverLostOrbs=(orbArray, canvasWidth, canvasHeight)=>{
    for(let i=0; i<orbArray.length; i++){
        if(orbArray[i].position.x>=canvasWidth) orbArray[i].position.x=randomInRange(0,canvasWidth)
        if(orbArray[i].position.y>=canvasHeight) orbArray[i].position.x=randomInRange(0,canvasHeight)
    }
    
}


const setCanvasSize=(canvas)=>{
    canvas.width=canvas.clientWidth;
    canvas.height=canvas.clientHeight;
}

const randomOrbArray=(count, width, height)=>{
    const orbArray=[]
    for(let i=0;i<count;i++){
        orbArray.push(new Orb({
            size: randomInRange(40,150),
            position: {x: randomInRange(0,width),y: randomInRange(0,height)},
            color: {r: randomInRange(0,255),g: randomInRange(0,255), b: randomInRange(0,255)},
            move: {x: randomInRange(1,5), y: randomInRange(1,5)}
        }))
    }
    return orbArray;
}

const randomInRange=(start, end)=>{
    return Math.floor(Math.random()*(end-start))+start;
}

const setDynamicLength=(shaderString, length)=>{
    const dataLengthSet=shaderString.replace(/<DYNAMIC_LENGTH>/, length*6);
    const arrSizeSet=dataLengthSet.replace(/<ORBCOUNT=0>/, `ORBCOUNT=${length}`);
    return arrSizeSet;
}

const updateOrbs=(orbArray, boundsX, boundsY)=>{
    for(let i=0; i<orbArray.length; i++){
        orbArray[i].updatePosition();
        if(orbArray[i].position.x>boundsX || orbArray[i].position.x<0) orbArray[i].move.x*=-1;
        if(orbArray[i].position.y>boundsY || orbArray[i].position.y<0) orbArray[i].move.y*=-1;  
    }
}


const u_orbDataFromArray=(orbArray)=>{
    const u_orbDataArray=[];
    for(let i=0; i<orbArray.length; i++){
        u_orbDataArray.push(orbArray[i].size);
        u_orbDataArray.push(orbArray[i].position.x);
        u_orbDataArray.push(orbArray[i].position.y);
        u_orbDataArray.push(orbArray[i].color.r/255); // scale colors to 0-1.0 for the shader to reduce math in loops there
        u_orbDataArray.push(orbArray[i].color.g/255);
        u_orbDataArray.push(orbArray[i].color.b/255);
    }
    return u_orbDataArray;
}


function render(gl, vertexShader, fragmentShader, orbArray) {


    // setup GLSL program
    const program = createShaderProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    let positionLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer to put three 2d clip space points in
    let positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, // tri 1
        1, -1,
        -1, 1,
        -1, 1, // tri 2
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);


    // look up time uniform location
    const uTimeLocation=gl.getUniformLocation(program, "u_time");
    
    // look up resolution uniform location
    const uResolutionLocation=gl.getUniformLocation(program, "u_resolution");

    // look up orb uniform array location
    const uOrbArrayLocation=gl.getUniformLocation(program, "u_orbData");

    const uDistModifierLocation=gl.getUniformLocation(program, "u_distanceModifier");

    gl.uniform1f(uDistModifierLocation, 5.0);
    // set resolution
    gl.uniform2fv(uResolutionLocation, [gl.canvas.width, gl.canvas.height]);
    gl.uniform1f(uTimeLocation, Date.now()/1000);
    


    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 2; // 2 components per iteration
    let type = gl.FLOAT; // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    window.onresize=function(){
        setCanvasSize(gl.canvas);

        
        recoverLostOrbs(orbArray, gl.canvas.width, gl.canvas.height);

        gl.uniform2fv(uResolutionLocation, [gl.canvas.clientWidth, gl.canvas.clientHeight]);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }



    let lastTime, startTime=Date.now();
    /* CALL WHEN SOMETHING CHANGES */
    const drawLoop = () => {
        const newTime=Date.now();
        const deltaTime=newTime-lastTime;
        gl.uniform1f(uTimeLocation, (Date.now()-startTime)/1000.0);
        

        updateOrbs(orbArray, gl.canvas.width, gl.canvas.height);
        gl.uniform1fv(uOrbArrayLocation, 
            u_orbDataFromArray(orbArray)    
        )
        
        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        lastTime=newTime;

       requestAnimationFrame(drawLoop);
    } // end drawLoop()

    drawLoop()


}




const createShaderProgram = (gl, vertexShaderSource, fragmentShaderSource) => {

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = createProgram(gl, vertexShader, fragmentShader);

    return program
}


const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const succes = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (succes) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}