import React, { useState, useRef, useEffect } from 'react';
import { DiningTableDto, TableStatus, StaffRole, TableLayoutDto, CreateTableRequestDto } from '@fabo/types';
import { 
  Users, Coffee, ArrowRightLeft, Merge, Grid, Map, Move, 
  Save, RotateCcw, AlertCircle, CheckCircle, Plus, Eye, Trash2, X 
} from 'lucide-react';

export interface TableMapProps {
  tables: DiningTableDto[];
  selectedTable: DiningTableDto | null;
  currentUserRole?: StaffRole;
  onSelectTable: (table: DiningTableDto) => void;
  onSaveLayout?: (updatedTables: TableLayoutDto[]) => Promise<void>;
  onTransferTable?: (sourceTableId: string, targetTableId: string) => Promise<void>;
  onMergeTable?: (sourceTableId: string, targetTableId: string) => Promise<void>;
  onAddTable?: (newTable: CreateTableRequestDto) => Promise<void>;
  onDeleteTable?: (tableId: string) => Promise<void>;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  selectedTable,
  currentUserRole = 'CASHIER',
  onSelectTable,
  onSaveLayout,
  onTransferTable,
  onMergeTable,
  onAddTable,
  onDeleteTable,
}) => {
  const [viewMode, setViewMode] = useState<'CANVAS' | 'GRID'>('CANVAS');
  const [activeArea, setActiveArea] = useState<string>('ALL');
  
  // Floor Plan Edit Mode state (RBAC: STORE_MANAGER or ADMIN)
  const canEditLayout = currentUserRole === 'STORE_MANAGER' || currentUserRole === 'ADMIN';
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [layoutTables, setLayoutTables] = useState<DiningTableDto[]>(tables);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Add Table Modal state
  const [isAddTableOpen, setIsAddTableOpen] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableArea, setNewTableArea] = useState<string>('Tầng 1 (Máy Lạnh)');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);
  const [newTableShape, setNewTableShape] = useState<'RECTANGLE' | 'ROUND'>('RECTANGLE');
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);

  // Delete Confirm Modal state
  const [tableToDelete, setTableToDelete] = useState<DiningTableDto | null>(null);
  const [isDeletingTable, setIsDeletingTable] = useState<boolean>(false);

  // Transfer & Merge Modals state
  const [transferModalSource, setTransferModalSource] = useState<DiningTableDto | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [mergeModalSource, setMergeModalSource] = useState<DiningTableDto | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Dragging state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync tables from prop when not editing
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLayoutTables(tables);
    }
  }, [tables, hasUnsavedChanges]);

  // Unique areas
  const areas = ['ALL', ...Array.from(new Set(tables.map((t) => t.areaName)))];

  const currentTables = isEditMode ? layoutTables : tables;
  const filteredTables = activeArea === 'ALL'
    ? currentTables
    : currentTables.filter((t) => t.areaName === activeArea);

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'EMPTY':
        return 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/60';
      case 'OCCUPIED':
        return 'border-blue-500/60 bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 border-blue-400';
      case 'RESERVED':
        return 'border-purple-500/50 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border-purple-400';
      case 'CLEANING':
        return 'border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400';
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'EMPTY':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Trống</span>;
      case 'OCCUPIED':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Có Khách</span>;
      case 'RESERVED':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Đặt Trước</span>;
      case 'CLEANING':
        return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Chờ Dọn</span>;
    }
  };

  // --- DRAG AND DROP HANDLERS FOR 2D FLOOR PLAN BUILDER ---
  const handleMouseDown = (e: React.MouseEvent, table: DiningTableDto) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const currentX = table.posX ?? 50;
    const currentY = table.posY ?? 50;

    setDraggingTableId(table.id);
    setDragOffset({
      x: e.clientX - canvasRect.left - currentX,
      y: e.clientY - canvasRect.top - currentY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEditMode || !draggingTableId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - canvasRect.left - dragOffset.x;
    const rawY = e.clientY - canvasRect.top - dragOffset.y;

    const snappedX = Math.max(10, Math.min(canvasRect.width - 150, Math.round(rawX / 10) * 10));
    const snappedY = Math.max(10, Math.min(canvasRect.height - 120, Math.round(rawY / 10) * 10));

    setLayoutTables((prev) =>
      prev.map((t) => (t.id === draggingTableId ? { ...t, posX: snappedX, posY: snappedY } : t))
    );
    setHasUnsavedChanges(true);
  };

  const handleMouseUp = () => {
    if (draggingTableId) {
      setDraggingTableId(null);
    }
  };

  const handleSaveLayout = async () => {
    if (!onSaveLayout) return;
    setIsSaving(true);
    try {
      const payload: TableLayoutDto[] = layoutTables.map((t) => ({
        id: t.id,
        posX: t.posX ?? 50,
        posY: t.posY ?? 50,
        width: t.width ?? 130,
        height: t.height ?? 110,
        rotation: t.rotation ?? 0,
      }));
      await onSaveLayout(payload);
      setHasUnsavedChanges(false);
      setIsEditMode(false);
    } catch (err) {
      alert('Lỗi lưu sơ đồ mặt bằng!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setLayoutTables(tables);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  // --- ADD TABLE ACTION ---
  const handleConfirmAddTable = async () => {
    if (!newTableName.trim() || !onAddTable) return;
    setIsAddingTable(true);
    try {
      const areaIdMap: Record<string, string> = {
        'Tầng 1 (Máy Lạnh)': 'A1',
        'Sân Vườn Ngoài Trời': 'A2',
        'Phòng VIP': 'A3',
      };
      const areaId = areaIdMap[newTableArea] || 'A1';

      await onAddTable({
        tableName: newTableName.trim(),
        areaId,
        areaName: newTableArea,
        capacity: newTableCapacity,
        shape: newTableShape,
        posX: 120,
        posY: 120,
        width: newTableShape === 'ROUND' ? 120 : 130,
        height: newTableShape === 'ROUND' ? 120 : 110,
      });

      setIsAddTableOpen(false);
      setNewTableName('');
      setNewTableCapacity(4);
    } catch (err) {
      alert('Lỗi khi thêm bàn mới!');
    } finally {
      setIsAddingTable(false);
    }
  };

  // --- DELETE TABLE ACTION ---
  const handlePromptDeleteTable = (table: DiningTableDto) => {
    if (table.status === 'OCCUPIED' || table.activeOrderId) {
      alert(`Không thể xóa ${table.tableName} vì bàn đang có khách hoặc đang có đơn phục vụ!`);
      return;
    }
    setTableToDelete(table);
  };

  const handleConfirmDeleteTable = async () => {
    if (!tableToDelete || !onDeleteTable) return;
    setIsDeletingTable(true);
    try {
      await onDeleteTable(tableToDelete.id);
      setTableToDelete(null);
    } catch (err) {
      alert('Lỗi khi xóa bàn!');
    } finally {
      setIsDeletingTable(false);
    }
  };

  // --- TRANSFER & MERGE TABLE ACTIONS ---
  const handleConfirmTransfer = async () => {
    if (!transferModalSource || !transferTargetId || !onTransferTable) return;
    setActionLoading(true);
    try {
      await onTransferTable(transferModalSource.id, transferTargetId);
      setTransferModalSource(null);
      setTransferTargetId('');
    } catch (err) {
      alert('Lỗi khi chuyển bàn!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmMerge = async () => {
    if (!mergeModalSource || !mergeTargetId || !onMergeTable) return;
    setActionLoading(true);
    try {
      await onMergeTable(mergeModalSource.id, mergeTargetId);
      setMergeModalSource(null);
      setMergeTargetId('');
    } catch (err) {
      alert('Lỗi khi gộp bàn!');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-slate-950 p-4 select-none relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar: View Mode Switcher + Area Tabs + RBAC Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3 mb-3">
        {/* Left: View Mode & Area Filters */}
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('CANVAS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'CANVAS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Sơ Đồ 2D</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'GRID'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Dạng Thẻ</span>
            </button>
          </div>

          {/* Area Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setActiveArea(area)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeArea === area
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                {area === 'ALL' ? 'Tất cả khu vực' : area}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Legend & RBAC Layout Builder Controls */}
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-400 mr-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Có khách</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Đặt trước</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chờ dọn</span>
          </div>

          {/* Add Table Button (STORE_MANAGER or ADMIN) */}
          {canEditLayout && (
            <button
              onClick={() => setIsAddTableOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Thêm bàn ăn mới vào nhà hàng"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bàn</span>
            </button>
          )}

          {/* RBAC Edit Floor Plan Controls */}
          {canEditLayout && (
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleDiscardChanges}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={handleSaveLayout}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu Bố Cục'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setViewMode('CANVAS');
                    setIsEditMode(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  title="Chỉ Quản lý (STORE_MANAGER/ADMIN) mới có quyền chỉnh sửa vị trí bàn"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Sửa Mặt Bằng 2D</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Notification Banner */}
      {isEditMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-2xl mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 animate-pulse" />
            <span className="font-bold">
              Chế độ điều chỉnh vị trí bàn: Kéo thả các bàn đến vị trí thực tế trên sơ đồ nhà hàng. Bạn cũng có thể xóa bàn trống bằng biểu tượng thùng rác. Nhấn "Lưu Bố Cục" khi hoàn tất.
            </span>
          </div>
          {hasUnsavedChanges && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
              Chưa lưu thay đổi
            </span>
          )}
        </div>
      )}

      {/* VIEW MODE 1: 2D FLOOR PLAN CANVAS */}
      {viewMode === 'CANVAS' && (
        <div
          ref={canvasRef}
          className="flex-1 bg-slate-900/60 rounded-3xl border border-slate-800 relative overflow-hidden shadow-inner"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            const isDragging = draggingTableId === table.id;
            const x = table.posX ?? 50;
            const y = table.posY ?? 50;
            const w = table.width ?? 135;
            const h = table.height ?? 115;
            const isRound = table.shape === 'ROUND';

            return (
              <div
                key={table.id}
                onMouseDown={(e) => handleMouseDown(e, table)}
                onClick={() => {
                  if (!isEditMode) onSelectTable(table);
                }}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                }}
                className={`transition-shadow p-3 border-2 flex flex-col justify-between select-none ${
                  isRound ? 'rounded-full text-center' : 'rounded-2xl'
                } ${getStatusColor(table.status)} ${
                  isEditMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-400' : 'cursor-pointer'
                } ${
                  isSelected ? 'ring-4 ring-emerald-400 scale-102 shadow-xl z-20' : 'shadow-md z-10'
                } ${isDragging ? 'opacity-80 scale-105 z-30' : ''}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-sm tracking-tight text-white truncate max-w-[70px]">
                    {table.tableName}
                  </span>
                  {getStatusBadge(table.status)}
                </div>

                {/* Capacity & Area */}
                <div className="my-auto space-y-0.5 text-[10px] opacity-80">
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} chỗ</span>
                  </div>
                  {table.status === 'OCCUPIED' && (
                    <div className="font-mono font-bold text-amber-300 truncate">
                      #{table.activeOrderId || 'ORD'}
                    </div>
                  )}
                </div>

                {/* Table Quick Actions on Hover */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                  <span className="text-[9px] opacity-70 truncate">{table.areaName}</span>
                  <div className="flex items-center gap-1">
                    {/* Delete button (Manager / Admin) */}
                    {canEditLayout && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptDeleteTable(table);
                        }}
                        title="Xóa bàn"
                        className="p-1 rounded-md bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {!isEditMode && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransferModalSource(table);
                          }}
                          title="Chuyển bàn sang bàn trống khác"
                          className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMergeModalSource(table);
                          }}
                          title="Gộp bàn với bàn khác"
                          className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                        >
                          <Merge className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: CLASSIC GRID CARDS */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 overflow-y-auto pr-1 flex-1">
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;

            return (
              <div
                key={table.id}
                onClick={() => onSelectTable(table)}
                className={`relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 shadow-sm flex flex-col justify-between h-36 ${getStatusColor(
                  table.status
                )} ${
                  isSelected
                    ? 'ring-4 ring-emerald-400 scale-102 shadow-lg'
                    : 'hover:scale-101 hover:shadow'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-black text-base text-white tracking-tight">
                    {table.tableName}
                  </span>
                  {getStatusBadge(table.status)}
                </div>

                <div className="my-auto space-y-1">
                  <div className="flex items-center gap-1 text-xs opacity-75">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{table.areaName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-75">
                    <Users className="w-3.5 h-3.5" />
                    <span>Sức chứa: {table.capacity} khách</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] opacity-80">
                  {table.status === 'OCCUPIED' ? (
                    <span className="font-mono font-bold text-amber-300">#{table.activeOrderId}</span>
                  ) : (
                    <span>Sẵn sàng đón khách</span>
                  )}
                  <div className="flex gap-1 items-center">
                    {/* Delete button (Manager / Admin) */}
                    {canEditLayout && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptDeleteTable(table);
                        }}
                        title="Xóa bàn"
                        className="p-1 rounded hover:bg-rose-600/80 text-slate-300 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransferModalSource(table);
                      }}
                      title="Chuyển bàn"
                      className="p-1 rounded hover:bg-white/10 text-slate-200"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMergeModalSource(table);
                      }}
                      title="Gộp bàn"
                      className="p-1 rounded hover:bg-white/10 text-slate-200"
                    >
                      <Merge className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL THÊM BÀN (ADD TABLE) --- */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Thêm Bàn Ăn Mới</h3>
                  <p className="text-xs text-slate-400">Khởi tạo bàn mới trong sơ đồ nhà hàng</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTableOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên bàn (VD: Bàn 08, VIP 02, Sân Vườn 3):
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Nhập tên bàn..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Khu vực:
                </label>
                <select
                  value={newTableArea}
                  onChange={(e) => setNewTableArea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="Tầng 1 (Máy Lạnh)">Tầng 1 (Máy Lạnh)</option>
                  <option value="Sân Vườn Ngoài Trời">Sân Vườn Ngoài Trời</option>
                  <option value="Phòng VIP">Phòng VIP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Sức chứa (Khách):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(Number(e.target.value) || 2)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Hình dáng bàn:
                  </label>
                  <select
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value as 'RECTANGLE' | 'ROUND')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="RECTANGLE">Hình chữ nhật</option>
                    <option value="ROUND">Hình tròn</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!newTableName.trim() || isAddingTable}
                onClick={handleConfirmAddTable}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20"
              >
                {isAddingTable ? 'Đang tạo...' : 'Xác Nhận Tạo Bàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL XÁC NHẬN XÓA BÀN (DELETE TABLE) --- */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Xác Nhận Xóa Bàn?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa <strong className="text-white">{tableToDelete.tableName}</strong> ({tableToDelete.areaName}) khỏi hệ thống? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingTable}
                onClick={handleConfirmDeleteTable}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/30"
              >
                {isDeletingTable ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHUYỂN BÀN (TRANSFER TABLE) --- */}
      {transferModalSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Chuyển Bàn Ăn</h3>
                <p className="text-xs text-slate-400">
                  Chuyển order từ <strong>{transferModalSource.tableName}</strong> sang bàn khác
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Chọn bàn đích (Bàn trống):
              </label>
              <select
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn bàn trống --</option>
                {tables
                  .filter((t) => t.id !== transferModalSource.id && t.status === 'EMPTY')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableName} ({t.areaName} - {t.capacity} chỗ)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTransferModalSource(null);
                  setTransferTargetId('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!transferTargetId || actionLoading}
                onClick={handleConfirmTransfer}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-black transition"
              >
                {actionLoading ? 'Đang chuyển...' : 'Xác Nhận Chuyển'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL GỘP BÀN (MERGE TABLE) --- */}
      {mergeModalSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Merge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Gộp Bàn Ăn</h3>
                <p className="text-xs text-slate-400">
                  Gộp hóa đơn từ <strong>{mergeModalSource.tableName}</strong> vào bàn khác
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Chọn bàn cần gộp chung vào (Bàn đang có khách):
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500"
              >
                <option value="">-- Chọn bàn đích cần gộp vào --</option>
                {tables
                  .filter((t) => t.id !== mergeModalSource.id && t.status === 'OCCUPIED')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableName} (#{t.activeOrderId || 'ORD'} - {t.areaName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMergeModalSource(null);
                  setMergeTargetId('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!mergeTargetId || actionLoading}
                onClick={handleConfirmMerge}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-black transition"
              >
                {actionLoading ? 'Đang gộp...' : 'Xác Nhận Gộp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
