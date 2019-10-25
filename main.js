window.onload = function () {
    this.document.title = "loaded"

    const glCanvas = this.document.getElementById("glCanvas");
    const glContext = glCanvas.getContext("webgl");

    const fragShader = this.document.getElementById("fragShader").innerHTML;
    const vertShader = this.document.getElementById("vertShader").innerHTML;





    function render(gl, vertexShader, fragmentShader) {


        // setup GLSL program
        const program = createShaderProgram(gl, vertexShader, fragmentShader);

        // look up where the vertex data needs to go.
        let positionLocation = gl.getAttribLocation(program, "a_position");

        // Create a buffer to put three 2d clip space points in
        let positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image
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
        
        const uResolutionLocation=gl.getUniformLocation(program, "u_resolution");

        // set resolution
        gl.uniform2fv(uResolutionLocation, [800.0, 800.0]);
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


        


        let lastTime, startTime=Date.now();
        /* CALL WHEN SOMETHING CHANGES */
        const drawLoop = () => {
            const newTime=Date.now();
            const deltaTime=newTime-lastTime;
            gl.uniform1f(uTimeLocation, (Date.now()-startTime)/1000.0);
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


    render(glContext, vertShader, fragShader);

}