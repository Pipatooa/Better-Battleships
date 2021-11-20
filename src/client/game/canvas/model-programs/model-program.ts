export class ModelProgram<A extends string, U extends string> {

    public readonly program: WebGLProgram;

    private readonly vertexShader: WebGLShader;
    private readonly fragmentShader: WebGLShader;

    private readonly vertexBuffer: WebGLBuffer;
    private readonly vertexCount: number;

    private readonly attributeLocations: number[];
    public readonly uniformLocations: Record<U, WebGLUniformLocation>;

    public constructor(private readonly gl: WebGL2RenderingContext,
                       vertexShaderSource: string,
                       fragmentShaderSource: string,
                       vertexData: number[],
                       attributes: [A, number][],
                       uniformNames: readonly U[]) {

        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;

        this.gl.shaderSource(this.vertexShader, vertexShaderSource);
        this.gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        this.gl.compileShader(this.vertexShader);
        this.gl.compileShader(this.fragmentShader);

        if (!(this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS) as boolean))
            console.error('ERROR compiling vertex shader!', this.gl.getShaderInfoLog(this.vertexShader),
                vertexShaderSource.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'));
        if (!(this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS) as boolean))
            console.error('ERROR compiling fragment shader!', this.gl.getShaderInfoLog(this.fragmentShader),
                fragmentShaderSource.split('\n').map((l, i) => `${i + 1}:  ${l}`).join('\n'));

        this.program = gl.createProgram()!;

        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);

        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        this.vertexBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexData), this.gl.STATIC_DRAW);

        this.attributeLocations = [];
        let stride = 0;
        for (const [, size] of attributes) {
            stride += size * Float32Array.BYTES_PER_ELEMENT;
        }
        let offset = 0;
        for (const [attributeName, size] of attributes) {
            const attributeLocation = this.gl.getAttribLocation(this.program, attributeName);
            this.gl.vertexAttribPointer(attributeLocation, size, this.gl.FLOAT, false, stride, offset);
            if (attributeLocation === -1)
                console.error(`ERROR cannot find attribute '${attributeName}'`);
            this.attributeLocations.push(attributeLocation);
            offset += size * Float32Array.BYTES_PER_ELEMENT;
        }
        this.vertexCount = vertexData.length * Float32Array.BYTES_PER_ELEMENT / stride;

        this.uniformLocations = {} as Record<U, WebGLUniformLocation>;
        for (const uniformName of uniformNames) {
            const uniformLocation = this.gl.getUniformLocation(this.program, uniformName)!;
            if (uniformLocation === -1)
                console.error(`ERROR cannot find uniform '${uniformName}'`);
            this.uniformLocations[uniformName] = uniformLocation;
        }
    }

    public executeProgram(): void {
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        for (const attributeLocation of Object.values(this.attributeLocations))
            this.gl.enableVertexAttribArray(attributeLocation);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}
