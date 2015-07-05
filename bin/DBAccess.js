// bin/getRows.js
var loki = require( 'lokijs' );
var _ = require( 'underscore' )._;
var debug = require( 'debug' )( 'roman:DBAccess' );

var DBAccess = {
    db: null,
    region_collection: null,

    CreateDB: function( dbName, collName ) {
        // Create the database:
        this.db = new loki( dbName != null ? dbName : 'loki.json' );

        // Create a collection:
        this.region_collection = this.db.addCollection(
            collName != null ? collName : 'region' );
    },

    AddRegion: function( region, callback ) {
        debug( "--> AddRegion( " + region.id + " )" );
        debug( "typeof region = ", typeof region );
        debug( region );
        if ( !region.hasOwnProperty( "id" ) ) {
            callback( "Error: missing id field" );
            return;
        }
        if ( !region.hasOwnProperty( "loc" ) ) {
            callback( "Error: missing loc field" );
            return;
        }
        if ( !region.loc.hasOwnProperty( "x" ) ||
            !region.loc.hasOwnProperty( "y" ) ||
            !region.loc.hasOwnProperty( "z" ) ) {
            callback( "Error: missing coord field in loc" );
            return;
        }
        if ( region.loc.x + region.loc.y + region.loc.z != 0 ) {
            callback( "Error: x,y,z coords must sum to zero for proper cube grid system" );
            return;
        }
        if ( FetchById( region.id ) ) {
            callback( "Error: duplicate id: " + region.id + " already in DB" );
            return;
        }
        try {
            this.region_collection.insert( region );
            callback( null, "AddRegion: inserted region id: " + region.id );
        } catch ( e ) {
            console.error( "AddRegion->Insert error: ", e );
            callback( e );
        }

    },

    GetRegionByCoords: function( x, y, z, callback ) {
        debug( "--> GetRegionByCoords( ", x, y, z );
        /*        var rows = this.dp_collection.find( {
                    customerId: {
                        $eq: cuId
                    }
                } );
                rows = CleanMeta( rows );

                return JSON.stringify( rows );*/
        callback( "Error: not implemented" );
    },

    GetRegionById: function( getId, callback ) {
        debug( "--> GetRegionById( ", getId );
        var region = FetchById( getId );
        if ( region ) {
            var result = JSON.stringify( region );
            debug( "----> sending:", result )
            callback( null, result );
        } else {
            callback( "id not found: " + getId );
        }
    }

}

function CleanMeta( rows ) {
    for ( p in rows ) {
        delete rows[ p ].meta;
    };
    return rows;
}



function FetchById( getId ) {
    var region = DBAccess.region_collection.findOne( {
        id: {
            $eq: getId
        }
    } );
    return region;
}


// Expects two loc objects containing x,y,z members and returns true if all are equal
function LocEquals( loc1, loc2 ) {
    return _.isEqual( loc1, loc2 );
    //throw { name: "Not implemented", message: "LocEquals function" };
}

exports.DAO = DBAccess;
exports.LocEquals = LocEquals;
