var assert = require( 'assert' );
var request = require( 'request' );
var DAO = require( '../bin/DBAccess' ).DAO;
var le = require( '../bin/DBAccess' ).LocEquals;
var debug = require( 'debug' )( 'test:DBAccess' );



describe( 'Can setup DB with default values', function() {
    before( function( done ) {
        DAO.CreateDB();
        done();
    } );
    after( function( done ) {
        // remove the db instance
        DAO.db = null;
        done();
    } );
    it( 'Sets the db pointer to loki.json', function( done ) {
        assert.equal( DAO.db.filename, 'loki.json' );
        assert.notEqual( null, DAO.db );
        done();
    } );

    it( 'Creates collection pointer with default name: region', function( done ) {
        assert.notEqual( null, DAO.region_collection );
        assert.equal( DAO.region_collection.name, 'region' );
        done();
    } );
} )

describe( 'Can setup DB with specified values', function() {
    before( function( done ) {
        DAO.CreateDB( 'testdb.json', 'testcoll' );
        done();
    } );
    after( function( done ) {
        // remove the db instance
        DAO.db = null;
        done();
    } );
    it( 'Sets the db pointer to testdb.json', function( done ) {
        assert.equal( DAO.db.filename, 'testdb.json' );
        assert.notEqual( null, DAO.db );
        done();
    } );

    it( 'Creates region_collection pointer to testcoll', function( done ) {
        assert.notEqual( null, DAO.region_collection );
        assert.equal( DAO.region_collection.name, 'testcoll' );
        done();
    } );
} )

describe( 'Can add points', function() {
    var result, err
    before( function( done ) {
        DAO.CreateDB( 'add_db.json', 'add_coll' );
        DAO.AddRegion( CreateSampleRecord(), function( e, r ) {
            err = e;
            result = r;
        } );
        done();
    } );
    after( function( done ) {
        DAO.db = null;
        done();
    } );
    it( 'Does not return error on insert of correct schema', function( done ) {
        done( assert.equal( err, null ) );
    } );
    it( 'Returns error if id field is missing', function( done ) {
        var badRecord = CreateSampleRecord();
        delete badRecord.id;
        DAO.AddRegion( badRecord, function( e, r ) {
            debug( 'e:', e );
            assert( e && typeof e == "string" );
            assert( e.indexOf( 'id' ) > -1 );
            done();
        } );
    } )
    it( 'Returns error if the loc field is missing', function( done ) {
        var badRecord = CreateSampleRecord();
        delete badRecord.loc;
        DAO.AddRegion( badRecord, function( e, r ) {
            debug( 'e:', e );
            assert( e && typeof e == "string" );
            assert( e.indexOf( 'loc' ) > -1 );
            done();
        } );
    } )
    it( 'Returns error if loc field is missing x, y or z coords', function( done ) {
        var badRecord = CreateSampleRecord();
        delete badRecord.loc.x;
        DAO.AddRegion( badRecord, function( e, r ) {
            debug( 'e:', e );
            assert( e && typeof e == "string" );
            assert( e.indexOf( 'coord' ) > -1 );
            done();
        } );
    } )
    it( 'Returns error if loc x,y,z coords do not add up to zero', function( done ) {
        var badRecord = CreateSampleRecord();
        badRecord.loc.x = 25;
        DAO.AddRegion( badRecord, function( e, r ) {
            debug( 'e:', e );
            assert( e && typeof e == "string" );
            assert( e.indexOf( 'zero' ) > -1 );
            done();
        } );
    } )
    it( 'Enforces unique id field; returns err on duplicate insert', function( done ) {
        var dupRecord = CreateSampleRecord( 1313 );
        DAO.AddRegion( dupRecord, function( e, r ) {
            debug( 'e:', e );
            assert( e && typeof e == "string", "Expect err string returned" );
            assert( e.indexOf( 'duplicate' ) > -1,
                "Should include 'duplicate' in error msg" );
            assert( e.indexOf( ' id' ) > -1, "Should include ' id' in error msg" );
            done();
        } );
    } )

} );

describe( 'Can retrieve region by Id', function() {
    before( function( done ) {
        DAO.CreateDB( 'store_db.json', 'retrieve_coll' );
        DAO.AddRegion( CreateSampleRecord( 1557 ), function( e, r ) {} );
        DAO.AddRegion( CreateSampleRecord( 3333 ), function( e, r ) {} );
        DAO.AddRegion( CreateSampleRecord( 99 ), function( e, r ) {} );
        done();
    } )
    after( function( done ) {
        DAO.db = null;
        done();
    } )
    it( 'Retrieves region for Id 3333', function( done ) {
        DAO.GetRegionById( 3333, function( e, r ) {
            debug( e, r );
            assert( !e, "Callback error: " + e );
            result = JSON.parse( r ).id;
            debug( "result:", result );
            assert.equal( result, 3333,
                "id of returned region doesn't match expected" );
            done();
        } );
    } )
    it( 'Returns error on non-existent Id 998877', function( done ) {
        DAO.GetRegionById( 998877, function( e, r ) {
            debug( e, r );
            assert( e, "Expected err in callback" );
            assert( e.indexOf( 'not found' ) > -1 );
            assert( e.indexOf( '998877' ) > -1 );
            done();
        } );
    } )
} );

describe( 'LocEquals helper function', function() {
        it( 'Returns true when x y z are equal', function( done ) {
            loc1 = {
                x: 12,
                y: 13,
                z: 14
            };
            loc2 = {
                x: 12,
                y: 13,
                z: 14
            };
            assert( le( loc1, loc2 ), "LocEquals should return true" );
            done();
        } )
        it( 'Returns false when x y are equal but z is not', function( done ) {
            loc1 = {
                x: 12,
                y: 13,
                z: 14
            };
            loc2 = {
                x: 12,
                y: 13,
                z: -9
            };
            assert( ! le( loc1, loc2 ), "LocEquals should return false" );
            done();
        } )

    } )
    /*
    describe( 'Can retrieve points by custId', function() {
        before( function( done ) {
            DAO.CreateDB( 'custid_db.json', 'retrieve_coll' );
            DAO.InsertRows( CreatePointsRow( 20, 115, 10 ) );
            DAO.InsertRows( CreatePointsRow( 20, 115, 7 ) );
            DAO.InsertRows( CreatePointsRow( 20, 98, 411 ) );
            DAO.InsertRows( CreatePointsRow( 23, 115, 2 ) );
            DAO.InsertRows( CreatePointsRow( 25, 222, 3 ) );
            DAO.InsertRows( CreatePointsRow( 18, "s1001", 32 ) );
            done();
        } );
        after( function( done ) {
            DAO.db = null;
            done();
        } );
        it( 'Retrieves 3 records for custId 115', function( done ) {
            var result = DAO.GetRowsByCustId( 115 );
            assert.equal( JSON.parse( result ).length, 3 );
            done();
        } );
        it( 'Retrieves 0 records for non-existent custId 20', function( done ) {
            var result = DAO.GetRowsByCustId( 20 );
            assert.equal( JSON.parse( result ).length, 0 );
            done();
        } );
        it( 'Retrieves 1 record for string based custId s1001', function( done ) {
            var result = DAO.GetRowsByCustId( 's1001' );
            assert.equal( JSON.parse( result ).length, 1 );
            done();
        } );
    } );

    describe( 'Can delete records by storeId', function() {
        before( function( done ) {
            DAO.CreateDB( 'delete.json', 'delete_coll' );
            DAO.InsertRows( CreatePointsRow( 20, 115, 10 ) );
            DAO.InsertRows( CreatePointsRow( 20, 115, 7 ) );
            DAO.InsertRows( CreatePointsRow( 20, 98, 17 ) );
            DAO.InsertRows( CreatePointsRow( 23, 115, 2 ) );
            DAO.InsertRows( CreatePointsRow( 25, 222, 3 ) );
            DAO.InsertRows( CreatePointsRow( 18, "s1001", 32 ) );
            done();
        } );
        after( function( done ) {
            DAO.db = null;
            done();
        } );
        it( 'Deletes 3 records for storeId 20', function( done ) {
            // delete records than validate they are gone with a subsequent get
            DAO.DelRowsByStoreId( 20 );
            var result = DAO.GetRowsByStoreId( 20 );
            assert.equal( JSON.parse( result ).length, 0 );
            done();
        } );
    } );

    describe( 'ExtractAllDatapoints works as expected', function() {
        var rows = [];
        var result;
        before( function( done ) {
            rows.push( CreatePointsRow( 1, 1, 5 ) );
            rows.push( CreatePointsRow( 2, 2, 8 ) );
            rows.push( CreatePointsRow( 2, 5, 0 ) ); // empty datapoints, just in case
            rows.push( CreatePointsRow( 1, 5, 15 ) );
            result = extract( rows );
            //( result );
            done();
        } );
        it( 'Properly combines three unique rows', function( done ) {
            assert.equal( result.datapoints.length, 28 );
            done();
        } );
        it( 'The rows have all properties: x, y and value', function( done ) {
            assert( result.datapoints[ 0 ].hasOwnProperty( 'x' ) );
            assert( result.datapoints[ 0 ].hasOwnProperty( 'y' ) );
            assert( result.datapoints[ 0 ].hasOwnProperty( 'value' ) );
            done();
        } );
    } );

    /**** Helper functions and stuff ****/

// Generates test datapoints
function CreatePointsRow( stId, cuId, numPts ) {
    var rec = {
        "storeId": stId,
        "customerId": cuId,
        "timestamp": 2223334445,
    };

    var pts = [];
    for ( i = 0; i < numPts; i++ ) {
        var p = {
            "x": i,
            "y": i + 1,
            "value": 10
        };
        pts.push( p );
    };
    rec[ 'datapoints' ] = pts;
    debug( "Created: \n", rec );
    return rec;
}

function CreateSampleRecord( id ) {
    var rec = JSON.parse( JSON.stringify( sampleRecord ) );
    if ( id ) {
        rec.id = id
    };
    return rec;
}


// Expected format for datapoint records
var sampleRecord = {
    "id": 1313,
    "name": "Test Region",
    "loc": { // x,y,z hex grid loc
        "x": 20,
        "y": 30,
        "z": -50
    },
    "terrain": { // attributes tbd
        "description": "Some sort of urban war zone", // verbose description
        "movement": 80 // movement cost 0-100
    },
    "resources": { // list with 0-100 concentration
        "wood": 20,
        "flint": 2,
        "clay": 3,
        "cordage": 30
    }
}
