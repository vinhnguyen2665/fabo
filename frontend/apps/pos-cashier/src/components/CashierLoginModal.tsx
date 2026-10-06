import React, { useState, useEffect } from 'react';
import { StaffDto, CashierSessionDto } from '@fabo/types';
import { Lock, Delete, UserCheck, Shield, DollarSign, LogIn, AlertCircle } from 'lucide-react';

interface CashierLoginModalProps {
  isOpen: boolean;
  onSuccess: (session: CashierSessionDto) => void;
  currentStaff?: StaffDto | null;
  onCancel?: () => void;
}

export const CashierLoginModal: React.FC<CashierLoginModalProps> = ({
  isOpen,
  onSuccess,
  currentStaff,
  onCancel,
}) => {
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffDto | null>(currentStaff || null);
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showShiftPrompt, setShowShiftPrompt] = useState<boolean>(false);
  const [initialCash, setInitialCash] = useState<number>(1000000);
  const [authenticatedStaff, setAuthenticatedStaff] = useState<StaffDto | null>(null);

  // Fetch staff list from backend on mount
  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setErrorMessage('');
    setShowShiftPrompt(false);

    fetch('/api/v1/auth/pos/staff-list')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data: any) => {
        const list: StaffDto[] = Array.isArray(data) ? data : (data.body ?? []);
        if (Array.isArray(list) && list.length > 0) {
          setStaffList(list);
          if (!selectedStaff) {
            setSelectedStaff(list[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải danh sách nhân viên từ backend:', err);
      });
  }, [isOpen]);

  useEffect(() => {
    if (currentStaff) {
      setSelectedStaff(currentStaff);
    }
  }, [currentStaff]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen || showShiftPrompt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          setPin((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleSubmitPin();
      } else if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, selectedStaff, showShiftPrompt]);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const handleSubmitPin = async () => {
    if (!selectedStaff) {
      setErrorMessage('Vui lòng chọn nhân viên');
      return;
    }
    if (pin.length < 4) {
      setErrorMessage('Mã PIN tối thiểu 4 chữ số');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/auth/pos/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff.id,
          pinCode: pin,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        const payload = resData.body ?? resData;
        const staffData: StaffDto = payload.staff || payload;
        setAuthenticatedStaff(staffData);
        setShowShiftPrompt(true);
      } else {
        // Check offline/fallback match
        if (selectedStaff.pinCode === pin) {
          setAuthenticatedStaff(selectedStaff);
          setShowShiftPrompt(true);
        } else {
          setErrorMessage('Mã PIN không chính xác. Thử lại!');
          setPin('');
        }
      }
    } catch (_) {
      if (selectedStaff.pinCode === pin) {
        setAuthenticatedStaff(selectedStaff);
        setShowShiftPrompt(true);
      } else {
        setErrorMessage('Mã PIN không chính xác (Kiểm tra kết nối)');
        setPin('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmShift = () => {
    if (!authenticatedStaff) return;
    const session: CashierSessionDto = {
      staff: authenticatedStaff,
      initialCash,
      openedAt: new Date().toISOString(),
      shiftId: 'SHIFT-' + Date.now().toString().slice(-6),
    };
    onSuccess(session);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Top Header */}
        <div className="bg-slate-950/90 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight">
                {showShiftPrompt ? 'Mở Ca Làm Việc POS' : 'Đăng Nhập Thu Ngân / Nhân Viên'}
              </h2>
              <p className="text-xs text-slate-400">
                {showShiftPrompt ? 'Nhập số dư tiền mặt đầu ca để đối soát Z-Report' : 'Nhập mã PIN cá nhân để mở khóa phiên làm việc'}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
            >
              Đóng
            </button>
          )}
        </div>

        {showShiftPrompt ? (
          /* Step 2: Shift Open Cash Prompt */
          <div className="p-6 space-y-5">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                {authenticatedStaff?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{authenticatedStaff?.fullName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {authenticatedStaff?.role}
                  </span>
                </div>
                <span className="text-xs text-slate-400">@{authenticatedStaff?.username}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Tiền mặt đầu ca trong két (VND):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50000"
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xl font-mono font-black text-emerald-400 text-right outline-none transition"
                />
                <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-500">VNĐ</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[500000, 1000000, 2000000, 3000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialCash(amt)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {(amt / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowShiftPrompt(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmShift}
                className="flex-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Bắt Đầu Phiên POS</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Staff Selection + Numpad */
          <div className="p-6 space-y-4">
            {/* Staff Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Chọn nhân viên đăng nhập:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {staffList.map((st) => {
                  const isSelected = selectedStaff?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaff(st);
                        setPin('');
                        setErrorMessage('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                      <span className="font-bold text-xs truncate block">{st.fullName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono mt-1 font-semibold">
                        {st.role === 'STORE_MANAGER' ? 'Quản lý' : st.role === 'CASHIER' ? 'Thu ngân' : 'Phục vụ'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Display Dots */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
              <div className="flex gap-4 mb-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const hasChar = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${hasChar
                          ? 'bg-emerald-400 scale-125 shadow-sm shadow-emerald-400'
                          : 'bg-slate-800 border border-slate-700'
                        }`}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {pin.length > 0 ? `${pin.length}/6 ký tự` : 'Nhấn số trên màn hình hoặc bàn phím'}
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Numpad 0-9 */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-lg shadow-sm transition flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 active:scale-95 text-rose-400 text-xs font-bold transition flex items-center justify-center"
              >
                XÓA
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-lg shadow-sm transition flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 active:scale-95 text-slate-300 transition flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isLoading || pin.length < 4}
              onClick={handleSubmitPin}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${pin.length >= 4 && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Đang xác thực...' : 'Mở Khóa POS'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
