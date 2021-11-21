import boardFragmentShaderSource from '../shaders/board.frag';
import boardVertexShaderSource   from '../shaders/board.vert';
import { ModelProgram }          from './model-program';

export class BoardProgram extends ModelProgram<'vertPosition' | 'vertTextureCoord', UniformName> {
    public constructor(gl: WebGL2RenderingContext) {
        super(gl, boardVertexShaderSource, boardFragmentShaderSource,
            [
                -1, -1,
                -1, 1,
                1, -1,
                1, 1
            ],
            [
                ['vertPosition', 2]
            ],
            uniformNames
        );
    }
}

const uniformNames = [
    'offset', 'scale',
    'backgroundColor',
    'colorAtlas', 'colorAtlasSize',
    'tileTexture', 'borderRatio', 'borderColor',
    'borderTextureArray',
    'boardInfo', 'boardInfoSize', 'boardSize',
    'selectionInfo', 'selectionInfoSize', 'selectionSize', 'selectionOffset',
    'globalRenderFlags'
] as const;

type UniformName = typeof uniformNames[number];
