import json

from fastapi.responses import JSONResponse
from schema import payload
from tinydb import Query, TinyDB

variantDB = TinyDB("db/variant.json")
query = Query()

variantHeader = variantDB.table("variant_header")
variantData = variantDB.table("variant_data")

def deleteVariant(objectName, variantName):
    res1 = variantHeader.remove(
        (query.objectName == objectName)
        &
        (query.variantName == variantName)
    )

    res2 = variantData.remove(
        (query.objectName == objectName)
        &
        (query.variantName == variantName)
    )

    return JSONResponse(
        status_code=200, 
        content={
            "status_code": 200,
            "message": "Variant Deleted Successfully .",
            }
    )

def getObjectVariant(objectName):

    res = variantHeader.search(query.objectName==objectName)

    if res is None:
        return JSONResponse(
            status_code=404,
            content={
                "status": "error",
                "status_code": 404,
                "message": "No Variant Data found.",
            }
        )
    elif not isinstance(res, list):
        return [res]
    return res

def getVariantNames():
    return variantHeader.all()

def getVariantData(objectName, variantName):
    return variantData.get(
        (query.objectName == objectName)
        &
        (query.variantName == variantName)
    )


def addVariant(data, header):
    _data = data.dict()
    _header = header.dict()

    res_header = addVariantHeader(_header, header.objectName, header.variantName)

    res_data = variantData.upsert(
                    _data,
                    (
                        (query.objectName == data.objectName) 
                        & 
                        (query.variantName == data.variantName)
                    )
                )

    if res_header == [] or res_data == []:
        deleteVariant(header.objectName, header.variantName)
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "status_code": 400,
                "message": "Variant Failed to update/create .",
            }
        )

    return JSONResponse(
        status_code=200, content={"message": "Variant added/updated successfully"}
    )


def addVariantHeader(header, objectName, variantName):
    return variantHeader.upsert(
                    header, 
                    (
                        (query.objectName == objectName) 
                        & 
                        (query.variantName == variantName)
                    )
                )

def changeVariantName(objectName, variantName, newVariantName):
    exists = variantHeader.get(
        (query.objectName == objectName) &
        (query.variantName == variantName)
    )

    if exists == []:
        return JSONResponse(
            status_code=404,
            content={
                "status": "error",
                "status_code": 404,
                "message": "No Variant Data found.",
            }
        )
    
    res_header = variantHeader.update(
            {
                "objectName": objectName,
                "variantName": newVariantName
            },
            (query.objectName == objectName) 
                        & 
            (query.variantName == variantName)
        )
    
    res_data = variantData.update(
            {
                "objectName": objectName,
                "variantName": newVariantName
            },
            (query.objectName == objectName) 
                        & 
            (query.variantName == variantName)
        )

    
    return JSONResponse(
        status_code=200, 
        content={
            "status_code": 200,
            "message": "Variant Name Updated Successfully .",
            }
    )