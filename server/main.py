from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from schema import payload
from view import view

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

@app.get(
    "/variant/",
    summary="Get list of objects & thier Variants",
    description="Get list of objects & thier Variants .",
)
async def variant():
    return view.getVariantNames()

@app.get(
    "/variant/{object_name}/",
    summary="Get list of variant stored for Object",
    description="Get Variant Names stored for Object .",
)
async def variant(object_name: str):
    return view.getObjectVariant(object_name)


@app.get(
    "/variant/{object_name}/{variant_name}",
    summary="Get Data of Object & Variant",
    description="Get Data of Object & Variant .",
)
async def variant(object_name: str, variant_name: str):
    return view.getVariantData(object_name, variant_name)

@app.delete(
    "/variant/{object_name}/{variant_name}",
    summary="Delete Object's Variant & Data",
    description="Delete Object's Variant & Data .",
)
async def variant(object_name: str, variant_name: str):
    return view.deleteVariant(object_name, variant_name)


@app.post(
    "/variant/{object_name}/{variant_name}",
    summary="Update or Create Variant",
    description="Send Data of Object & Variant .",
)
async def variant(object_name: str, variant_name: str, _fields: dict):
    try:
        
        header = payload.objectHeader(
            objectName=object_name,
            variantName=variant_name,
        )

        data = payload.objectData(
            objectName=object_name, variantName=variant_name, fields=_fields["fields"]
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "error",
                "status_code": 400,
                "message": f"Invalid payload: {e}",
            },
        )
    
    return view.addVariant(data, header)

@app.post(
    "/variant/{object_name}/{variant_name}/to_{new_variant_name}",
    summary="Update Variant Name",
    description="Update Variant Name .",
)
async def variant(object_name: str, variant_name: str, new_variant_name:str):
    try:
        header = payload.objectHeader(
            objectName=object_name,
            variantName=variant_name,
        )

        header = payload.objectHeader(
            objectName=object_name,
            variantName=new_variant_name,
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "error",
                "status_code": 400,
                "message": f"Invalid payload: {e}",
            },
        )
    
    return view.changeVariantName(object_name, variant_name, new_variant_name)


@app.get(
    "/", summary="Check Connection", description="Check if connection is established."
)
async def root():
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Connection Established"}
    )
