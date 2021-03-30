
import Edge from "../edge";
import Operator from "../operator";

export default class Delay extends Operator {
    milliseconds : number
    timeouts : ReturnType<typeof setTimeout>[] = []

    constructor( milliseconds : number ) {
        super( apply, 'delay' )
        this.milliseconds = milliseconds
        this.destructor = () => {
            for ( const timeout of this.timeouts )
                clearTimeout( timeout );
            this.timeouts.length = 0
        }
    }
}

function apply( edge : Edge )
{
    //bind value now since it can change during the timeout:
    const value = edge.parent.value;
    const operator = edge.operator as Delay
    const timeout = setTimeout(
        () => {
            operator.timeouts.splice( operator.timeouts.indexOf( timeout ), 1 );
            edge.child.next( value );
        },
        operator.milliseconds
    );
    if ( ! operator.timeouts )
        operator.timeouts = [ timeout ];
    else
        operator.timeouts.push( timeout );
    return false;
}

