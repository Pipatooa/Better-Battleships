import boardFragmentShaderSource from '../shaders/board.frag';
import boardVertexShaderSource   from '../shaders/board.vert';
import { ModelProgram }          from './model-program';

/**
 * BoardProgram - Client Version
 *
 * Program for drawing a board to a canvas
 */
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

/**
 * Array of shader uniform names
 */
const uniformNames = [
    'offset', 'scale',
    'backgroundColor',
    'colorAtlas', 'colorAtlasSize',
    'tileTexture', 'borderRatio', 'borderColor',
    'borderTextureArray',
    'boardInfo', 'boardInfoSize', 'boardSize',
    'selectionInfo', 'selectionInfoSize', 'selectionSize', 'selectionOffset', 'selectionOpacity',
    'highlightMultiplier'
] as const;

/**
 * String union type matching all shader uniform names
 */
type UniformName = typeof uniformNames[number];
