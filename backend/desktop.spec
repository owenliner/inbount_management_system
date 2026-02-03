# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for Inbound Management System desktop app."""

import sys
import os
from pathlib import Path

block_cipher = None

# Collect Python shared library on Windows
binaries = []
if sys.platform == "win32":
    import sysconfig
    python_dir = Path(sysconfig.get_config_var('installed_base'))
    # Look for python3xx.dll in common locations
    for dll_name in [f"python{sys.version_info.major}{sys.version_info.minor}.dll",
                     f"python{sys.version_info.major}{sys.version_info.minor}t.dll"]:
        dll_path = python_dir / dll_name
        if dll_path.exists():
            binaries.append((str(dll_path), "."))
            break
        # Also check in the DLLs subdirectory
        dll_path = python_dir / "DLLs" / dll_name
        if dll_path.exists():
            binaries.append((str(dll_path), "."))
            break

# Paths
backend_dir = Path(SPECPATH)
project_root = backend_dir.parent
frontend_dist = project_root / "frontend" / "dist"
alembic_dir = backend_dir / "alembic"
alembic_ini = backend_dir / "alembic.ini"
seed_script = backend_dir / "seed_data.py"

# Collect frontend dist as data files
datas = []
if frontend_dist.is_dir():
    datas.append((str(frontend_dist), "frontend/dist"))
if alembic_dir.is_dir():
    datas.append((str(alembic_dir), "alembic"))
if alembic_ini.is_file():
    datas.append((str(alembic_ini), "."))
if seed_script.is_file():
    datas.append((str(seed_script), "."))

# Hidden imports that PyInstaller can't detect via static analysis
hiddenimports = [
    # uvicorn internals
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.protocols.http.httptools_impl",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.protocols.websockets.wsproto_impl",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "uvicorn.lifespan.off",
    # FastAPI / Starlette
    "multipart",
    "multipart.multipart",
    # App modules (dynamic imports via router registration)
    "app.api.v1",
    "app.api.v1.auth",
    "app.api.v1.bulletins",
    "app.api.v1.dashboard",
    "app.api.v1.goods_request",
    "app.api.v1.goods_types",
    "app.api.v1.inbound",
    "app.api.v1.purchase",
    "app.api.v1.stock",
    "app.api.v1.units",
    "app.api.v1.users",
    "app.api.v1.warehouses",
    "app.models",
    "app.models.user",
    "app.models.warehouse",
    "app.models.stock",
    "app.models.request",
    "app.models.bulletin",
    "app.services",
    "app.services.bulletin_service",
    "app.services.dashboard_service",
    "app.services.inbound_service",
    "app.services.request_service",
    "app.services.stock_service",
    "app.services.user_service",
    "app.services.warehouse_service",
    "app.schemas",
    "app.schemas.auth",
    "app.schemas.bulletin",
    "app.schemas.common",
    "app.schemas.request",
    "app.schemas.stock",
    "app.schemas.user",
    "app.schemas.warehouse",
    "app.core",
    "app.config",
    "app.database",
    # SQLAlchemy dialects
    "sqlalchemy.dialects.sqlite",
    # Passlib / bcrypt
    "passlib.handlers.bcrypt",
    "bcrypt",
    # Pydantic
    "pydantic",
    "pydantic_settings",
    # Jose / JWT
    "jose",
    "jose.jwt",
    "jose.backends",
    "jose.backends.cryptography_backend",
]

# Exclude modules not needed in desktop mode
excludes = [
    "psycopg2",
    "psycopg2-binary",
    "redis",
    "pytest",
    "black",
    "ruff",
]

a = Analysis(
    ["desktop_app.py"],
    pathex=[str(backend_dir)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="InboundManagement",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # No terminal window
    icon=None,  # Set to "icon.ico" (Windows) or "icon.icns" (macOS) if available
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="InboundManagement",
)

# macOS .app bundle
if sys.platform == "darwin":
    app = BUNDLE(
        coll,
        name="InboundManagement.app",
        icon=None,  # Set to "icon.icns" if available
        bundle_identifier="com.inbound.management",
        info_plist={
            "CFBundleDisplayName": "入库管理系统",
            "CFBundleShortVersionString": "1.0.0",
            "NSHighResolutionCapable": True,
        },
    )
