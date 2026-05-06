import React, { useRef } from 'react';
import { MOCK_MEMBERS } from '../../constants';
import type { CardProduct } from '../../types';
import type { MallTtcCourse } from './MallTtc';

export const createInitialContractData = () => ({
    memberId: '',
    productId: '',
    productType: 'card' as 'card' | 'ttc',
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    contractNo: `CON-${Date.now().toString().slice(-8)}`,
    partyAVenueId: 'v1',
    partyACompany: '杭州迈特瑜伽健身有限公司',
    partyAVenue: 'MetYoga 万象城店',
    partyACode: '91330100XXXXXXX',
    partyAAddress: '杭州市上城区万象城',
    partyAPhone: '0571-88888888',
    idType: '',
    idNumber: '',
    address: '',
    memberType: '新购',
    cardCategory: '额度型会籍',
    cardSubCategory: '初遇会籍（Spark）',
    ttcCourseName: 'RYT200 瑜伽教培',
    ttcBatch: '2026年春季班',
    ttcPaymentType: '全款',
    ttcLeaveCount: 3,
    quotaPoints: '',
    quotaCount: '',
    usageScope: '全城通馆',
    singleVenueName: '',
    usageTime: '全时段卡',
    totalDuration: '',
    bonusRights: '',
    activationMethod: '首次使用开卡',
    activationDate: '',
    packageDiscount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '微信',
    accountName: '杭州迈特瑜伽健身有限公司',
    accountBank: '招商银行杭州分行',
    accountNo: '123456789012345'
});

export type MallContractData = ReturnType<typeof createInitialContractData>;

const MOCK_VENUES_LIST = [
    {
        id: 'v1',
        name: 'MetYoga 万象城店',
        company: '杭州迈特瑜伽健身有限公司',
        code: '91330100XXXXXXX',
        address: '杭州市上城区万象城',
        phone: '0571-88888888',
        accountName: '杭州迈特瑜伽健身有限公司',
        accountBank: '招商银行杭州分行',
        accountNo: '123456789012345'
    },
    {
        id: 'v2',
        name: 'MetYoga 西湖旗舰店',
        company: '杭州迈特瑜伽健身有限公司西湖分公司',
        code: '91330100YYYYYYY',
        address: '杭州市西湖区湖滨银泰',
        phone: '0571-88888889',
        accountName: '杭州迈特瑜伽健身有限公司西湖分公司',
        accountBank: '招商银行杭州西湖支行',
        accountNo: '987654321098765'
    }
];

interface MallContractCreateProps {
  contractData: MallContractData;
  setContractData: React.Dispatch<React.SetStateAction<MallContractData>>;
  cards: CardProduct[];
  ttcCourses: MallTtcCourse[];
  handleBack: () => void;
}

const MallContractCreate: React.FC<MallContractCreateProps> = ({
  contractData,
  setContractData,
  cards,
  ttcCourses,
  handleBack,
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
      partyA: useRef<HTMLDivElement>(null),
      partyB: useRef<HTMLDivElement>(null),
      courseDetails: useRef<HTMLDivElement>(null),
      payment: useRef<HTMLDivElement>(null),
      leave: useRef<HTMLDivElement>(null),
      signatures: useRef<HTMLDivElement>(null),
  };

  const handleFocus = (sectionName: keyof typeof sectionRefs) => {
      const element = sectionRefs[sectionName].current;
      const container = previewContainerRef.current;
      
      if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
          const scrollTop = relativeTop - (containerRect.height / 2) + (elementRect.height / 2);
          
          container.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
          });
      }
  };

  const renderContractCreate = () => {
    const selectedMember = MOCK_MEMBERS.find(m => m.id === contractData.memberId);
    const selectedProduct = contractData.productType === 'card' 
        ? cards.find(c => c.id === contractData.productId)
        : ttcCourses.find(c => c.id === contractData.productId);

    return (
        <div className="animate-fadeIn flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">发起电子合同</h3>
                        <p className="text-xs text-gray-500">填写合同信息并预览签署效果</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition">保存草稿</button>
                    <button className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:opacity-80 transition shadow-lg shadow-black/10">发送给会员签署</button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Left: Form */}
                <div className="w-1/2 bg-white rounded-2xl border border-gray-100 p-8 overflow-y-auto custom-scroll shadow-sm">
                    <div className="space-y-8">
                        {/* Section 1: Party A */}
                        <section onFocus={() => handleFocus('partyA')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span>
                                甲方（提供方）信息
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5">选择场馆</label>
                                    <select 
                                        value={contractData.partyAVenueId}
                                        onChange={(e) => {
                                            const venueId = e.target.value;
                                            if (venueId === 'custom') {
                                                setContractData({...contractData, partyAVenueId: 'custom', partyACompany: '', partyAVenue: '', partyACode: '', partyAAddress: '', partyAPhone: '', accountName: '', accountBank: '', accountNo: ''});
                                            } else {
                                                const venue = MOCK_VENUES_LIST.find(v => v.id === venueId);
                                                if (venue) {
                                                    setContractData({
                                                        ...contractData, 
                                                        partyAVenueId: venueId,
                                                        partyACompany: venue.company,
                                                        partyAVenue: venue.name,
                                                        partyACode: venue.code,
                                                        partyAAddress: venue.address,
                                                        partyAPhone: venue.phone,
                                                        accountName: venue.accountName,
                                                        accountBank: venue.accountBank,
                                                        accountNo: venue.accountNo
                                                    });
                                                }
                                            }
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition appearance-none"
                                    >
                                        {MOCK_VENUES_LIST.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                        <option value="custom">自定义输入...</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-[38px] text-gray-400 pointer-events-none"></i>
                                </div>
                                
                                {contractData.partyAVenueId === 'custom' && (
                                    <>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">公司全称</label>
                                            <input type="text" value={contractData.partyACompany} onChange={e => setContractData({...contractData, partyACompany: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆简称</label>
                                            <input type="text" value={contractData.partyAVenue} onChange={e => setContractData({...contractData, partyAVenue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">统一社会信用代码</label>
                                            <input type="text" value={contractData.partyACode} onChange={e => setContractData({...contractData, partyACode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆地址</label>
                                            <input type="text" value={contractData.partyAAddress} onChange={e => setContractData({...contractData, partyAAddress: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆电话</label>
                                            <input type="text" value={contractData.partyAPhone} onChange={e => setContractData({...contractData, partyAPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        
                                        {/* Account Info */}
                                        <div className="col-span-2 mt-4">
                                            <h5 className="text-xs font-bold text-gray-700 mb-2">收款账户信息</h5>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">账户名称</label>
                                            <input type="text" value={contractData.accountName} onChange={e => setContractData({...contractData, accountName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">开户银行</label>
                                            <input type="text" value={contractData.accountBank} onChange={e => setContractData({...contractData, accountBank: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">银行账号</label>
                                            <input type="text" value={contractData.accountNo} onChange={e => setContractData({...contractData, accountNo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Section 2: Member Selection */}
                        <section onFocus={() => handleFocus('partyB')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span>
                                乙方（会员方）信息
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5">选择现有会员</label>
                                    <select 
                                        value={contractData.memberId}
                                        onChange={(e) => setContractData({...contractData, memberId: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition appearance-none"
                                    >
                                        <option value="">请选择会员...</option>
                                        {MOCK_MEMBERS.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-[38px] text-gray-400 pointer-events-none"></i>
                                </div>
                                <div className="col-span-2">
                                    <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-xs flex items-start gap-3">
                                        <i className="fa-solid fa-circle-info mt-0.5"></i>
                                        <p>会员的证件类型、证件号码、联系地址及确认的联系电话将由会员在收到合同后，于线上签署环节自行填写并确认，无需在此处录入。</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Product & Contract Details */}
                        <section onFocus={() => handleFocus('courseDetails')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</span>
                                {contractData.productType === 'card' ? '会员购买及账户信息' : '教培服务内容'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
                                        当前合同类型：<span className="font-bold text-black">{contractData.productType === 'card' ? '会员卡服务合同' : '教培课程服务合同'}</span>
                                    </div>
                                </div>

                                {contractData.productType === 'card' ? (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">会员类型</label>
                                            <select value={contractData.memberType} onChange={e => setContractData({...contractData, memberType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>新购</option><option>续费</option><option>升级</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">会员卡种大类</label>
                                            <select value={contractData.cardCategory} onChange={e => setContractData({...contractData, cardCategory: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>额度型会籍</option><option>畅练型会籍</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">具体卡种</label>
                                            <select value={contractData.cardSubCategory} onChange={e => setContractData({...contractData, cardSubCategory: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                {contractData.cardCategory === '额度型会籍' ? (
                                                    <><option>初遇会籍（Spark）</option><option>锦鲤会籍（Flow）</option><option>天选会籍（Prime）</option><option>硬核会籍（Core）</option><option>自由会籍（Flex）</option></>
                                                ) : (
                                                    <><option>普拉提月卡（Pilates 30）</option><option>瑜伽月卡（Yoga 30）</option><option>瑜伽季卡（Yoga 90）</option><option>瑜伽年卡（Yoga 365）</option></>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程配额 (点数)</label>
                                            <input type="number" value={contractData.quotaPoints} onChange={e => setContractData({...contractData, quotaPoints: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程配额 (次数)</label>
                                            <input type="number" value={contractData.quotaCount} onChange={e => setContractData({...contractData, quotaCount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">使用范围</label>
                                            <select value={contractData.usageScope} onChange={e => setContractData({...contractData, usageScope: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>全城通馆</option><option>签约单馆</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">使用时段</label>
                                            <select value={contractData.usageTime} onChange={e => setContractData({...contractData, usageTime: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>全时段卡</option><option>非高峰卡</option><option>周末全时段卡</option>
                                            </select>
                                        </div>
                                        {contractData.usageScope === '签约单馆' && (
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5">签约单馆名称</label>
                                                <input type="text" value={contractData.singleVenueName} onChange={e => setContractData({...contractData, singleVenueName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">生效日期</label>
                                            <input type="date" value={contractData.startDate} onChange={e => setContractData({...contractData, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">失效日期</label>
                                            <input type="date" value={contractData.endDate} onChange={e => setContractData({...contractData, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">总时长描述 (如: 365天)</label>
                                            <input type="text" value={contractData.totalDuration} onChange={e => setContractData({...contractData, totalDuration: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">开卡方式</label>
                                            <select value={contractData.activationMethod} onChange={e => setContractData({...contractData, activationMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>首次使用开卡</option><option>指定日期开卡</option>
                                            </select>
                                        </div>
                                        {contractData.activationMethod === '指定日期开卡' && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5">指定开卡日期</label>
                                                <input type="date" value={contractData.activationDate} onChange={e => setContractData({...contractData, activationDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                            </div>
                                        )}

                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">赠送权益</label>
                                            <input type="text" value={contractData.bonusRights} onChange={e => setContractData({...contractData, bonusRights: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">打包产品折价 (元)</label>
                                            <input type="number" value={contractData.packageDiscount} onChange={e => setContractData({...contractData, packageDiscount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">合同金额 (元)</label>
                                            <input type="number" value={contractData.amount} onChange={e => setContractData({...contractData, amount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付日期</label>
                                            <input type="date" value={contractData.paymentDate} onChange={e => setContractData({...contractData, paymentDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付方式</label>
                                            <select value={contractData.paymentMethod} onChange={e => setContractData({...contractData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>微信</option><option>支付宝</option><option>银行卡</option><option>现金</option><option>其他</option>
                                            </select>
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">其他会籍/补充约定</label>
                                            <textarea rows={2} value={contractData.notes} onChange={e => setContractData({...contractData, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition resize-none"></textarea>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程名称</label>
                                            <input type="text" value={contractData.ttcCourseName} onChange={e => setContractData({...contractData, ttcCourseName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" placeholder="例如：RYT200 培训课程" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程预计开始时间</label>
                                            <input type="date" value={contractData.startDate} onChange={e => setContractData({...contractData, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程预计结束时间</label>
                                            <input type="date" value={contractData.endDate} onChange={e => setContractData({...contractData, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">授课地点</label>
                                            <input type="text" value={contractData.partyAAddress} onChange={e => setContractData({...contractData, partyAAddress: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">培训费用合计 (元)</label>
                                            <input type="number" value={contractData.amount} onChange={e => setContractData({...contractData, amount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">付款阶段</label>
                                            <select value={contractData.ttcPaymentType} onChange={e => setContractData({...contractData, ttcPaymentType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option value="全款">全款</option>
                                                <option value="定金">定金</option>
                                                <option value="尾款">尾款</option>
                                            </select>
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付日期</label>
                                            <input type="date" value={contractData.paymentDate} onChange={e => setContractData({...contractData, paymentDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付渠道</label>
                                            <select value={contractData.paymentMethod} onChange={e => setContractData({...contractData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option value="支付宝">支付宝</option>
                                                <option value="微信">微信</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2" onFocus={() => handleFocus('leave')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">请假次数</label>
                                            <input type="number" value={contractData.ttcLeaveCount} onChange={e => setContractData({...contractData, ttcLeaveCount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right: Preview */}
                <div ref={previewContainerRef} className="w-1/2 bg-gray-200 rounded-2xl p-8 overflow-y-auto custom-scroll flex flex-col items-center">
                    <div className="bg-white shadow-2xl p-12 flex flex-col relative text-sm leading-relaxed text-gray-800 shrink-0" style={{ width: '100%', maxWidth: '794px', minHeight: '1123px' }}>
                        <h2 className="text-2xl font-bold text-center mb-8 tracking-widest">{contractData.productType === 'card' ? '会员服务合同' : '教培服务合同'}</h2>
                        
                        <div className="text-right mb-8">
                            <span className="font-bold">合同编号：</span>【 {contractData.contractNo} 】
                        </div>

                        <div className="space-y-6">
                            {contractData.productType === 'card' ? (
                                <>
                                    {/* Party A */}
                                    <div ref={sectionRefs.partyA}>
                                        <h3 className="font-bold text-base mb-2">甲方（提供方）：</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-2 pl-4">
                                            <span>公司全称：</span><span className="border-b border-gray-300">{contractData.partyACompany}</span>
                                            <span>场馆简称：</span><span className="border-b border-gray-300">{contractData.partyAVenue}</span>
                                            <span>统一社会信用代码：</span><span className="border-b border-gray-300">{contractData.partyACode}</span>
                                            <span>场馆地址：</span><span className="border-b border-gray-300">{contractData.partyAAddress}</span>
                                            <span>场馆电话：</span><span className="border-b border-gray-300">{contractData.partyAPhone}</span>
                                        </div>
                                    </div>

                                    {/* Party B */}
                                    <div ref={sectionRefs.partyB}>
                                        <h3 className="font-bold text-base mb-2">乙方（会员方）：</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-2 pl-4">
                                            <span>姓名／微信昵称：</span><span className="border-b border-gray-300">{selectedMember?.name || '________________'}</span>
                                            <span>性    别：</span><span className="border-b border-gray-300">{selectedMember ? (selectedMember.gender === 'female' ? '女' : '男') : '________________'}</span>
                                            <span>证件类型：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>证件号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>联系地址：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>联系电话：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员确认填写...</span>
                                        </div>
                                    </div>

                                    <p className="indent-8">
                                        依据《中华人民共和国民法典》《中华人民共和国消费者权益保护法》等相关法律法规规定，体育健身服务经营者（以下简称甲方）、消费者（指本合同会员姓名一栏的会员，以下简称乙方）双方在自愿、平等的基础上，就甲方向乙方提供会员健身服务，乙方接受会员服务达成如下约定，适用于线上（小程序）与线下（前台）双渠道操作，具有同等法律效力。
                                    </p>

                                    {/* Section 1 */}
                                    <div ref={sectionRefs.courseDetails}>
                                        <h3 className="font-bold text-base mb-2">一、会员购买及账户信息</h3>
                                        <div className="space-y-2 pl-4">
                                            <p>1.服务内容：甲方提供MET YOGA场馆通用的团课、小班课、私教课等服务；具体课程类型、扣点/扣课规则及适用范围以本合同约定及甲方小程序公示为准。</p>
                                            <p>2.会员类型： {contractData.memberType === '新购' ? '☑' : '□'} 新购 &emsp; {contractData.memberType === '续费' ? '☑' : '□'} 续费 &emsp; {contractData.memberType === '升级' ? '☑' : '□'} 升级</p>
                                            
                                            <p>3.会员卡种：</p>
                                            <div className="pl-4 space-y-1">
                                                <p>3.1.额度型会籍（期限+配额）： {contractData.cardSubCategory === '初遇会籍（Spark）' ? '☑' : '□'} 初遇会籍（Spark）&emsp; {contractData.cardSubCategory === '锦鲤会籍（Flow）' ? '☑' : '□'} 锦鲤会籍（Flow）&emsp; {contractData.cardSubCategory === '天选会籍（Prime）' ? '☑' : '□'} 天选会籍（Prime）&emsp; {contractData.cardSubCategory === '硬核会籍（Core）' ? '☑' : '□'} 硬核会籍（Core）&emsp; {contractData.cardSubCategory === '自由会籍（Flex）' ? '☑' : '□'} 自由会籍（Flex）</p>
                                                <p>3.2.畅练型会籍： {contractData.cardSubCategory === '普拉提月卡（Pilates 30）' ? '☑' : '□'} 普拉提月卡（Pilates 30）&emsp; {contractData.cardSubCategory === '瑜伽月卡（Yoga 30）' ? '☑' : '□'} 瑜伽月卡（Yoga 30）&emsp; {contractData.cardSubCategory === '瑜伽季卡（Yoga 90）' ? '☑' : '□'} 瑜伽季卡（Yoga 90）&emsp; {contractData.cardSubCategory === '瑜伽年卡（Yoga 365）' ? '☑' : '□'} 瑜伽年卡（Yoga 365）</p>
                                                <p>3.3.课程配额：点数 <span className="underline px-2">{contractData.quotaPoints || '___'}</span> 点 / 次数 <span className="underline px-2">{contractData.quotaCount || '___'}</span> 次（团课/小班/私教/工作坊等，以系统核销为准）。</p>
                                                <p>3.4.使用范围（重要）：</p>
                                                <div className="pl-4">
                                                    <p>{contractData.usageScope === '签约单馆' ? '☑' : '□'} 3.4.1. 签约单馆：仅限以下签约场馆使用：<span className="underline px-2">{contractData.singleVenueName || '___'}</span> 馆；</p>
                                                    <p>{contractData.usageScope === '全城通馆' ? '☑' : '□'} 3.4.2. 全城通馆：适用于甲方在营全部场馆（以甲方公示为准）。</p>
                                                    <p>单馆会籍不因门店增减自动变更适用范围；如需变更，按本合同转卡/变更规则办理。</p>
                                                </div>
                                                <p>3.5.其他会籍/补充约定：<span className="underline px-2">{contractData.notes || '________________________________________________'}</span>。</p>
                                            </div>
                                            <p>4.使用时段： {contractData.usageTime === '全时段卡' ? '☑' : '□'} 全时段卡 &emsp; {contractData.usageTime === '非高峰卡' ? '☑' : '□'} 非高峰卡(使用时间段14:00 - 16:00) &emsp; {contractData.usageTime === '周末全时段卡' ? '☑' : '□'} 周末全时段卡</p>
                                            <p>5.会籍期限（权益期）： <span className="underline px-2">{contractData.startDate || '____年__月__日'}</span> 至 <span className="underline px-2">{contractData.endDate || '____年__月__日'}</span>，共计 <span className="underline px-2">{contractData.totalDuration || '____'}</span>。</p>
                                            <p>6.赠送权益： <span className="underline px-2">{contractData.bonusRights || '________________'}</span> （赠送权益随主会籍规则激活，使用期限与限制以甲方公示及本合同相关条款为准）。</p>
                                            <p>7.开卡方式： {contractData.activationMethod === '首次使用开卡' ? '☑' : '□'} 首次使用开卡 &emsp; {contractData.activationMethod === '指定日期开卡' ? '☑' : '□'} 指定日期开卡（<span className="underline px-2">{contractData.activationDate || '____年__月__日'}</span>）</p>
                                            <p>8.打包产品：折价人民币 <span className="underline px-2">{contractData.packageDiscount || '___'}</span> 元</p>
                                            <p>9.合同金额：人民币 <span className="underline px-2">{contractData.amount || '___'}</span> 元</p>
                                            <p>10.支付日期： <span className="underline px-2">{contractData.paymentDate || '____年__月__日'}</span></p>
                                            <p>11.支付方式： {contractData.paymentMethod === '微信' ? '☑' : '□'} 微信 &emsp; {contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 &emsp; {contractData.paymentMethod === '银行卡' ? '☑' : '□'} 银行卡(POS刷卡/转账) &emsp; {contractData.paymentMethod === '现金' ? '☑' : '□'} 现金 &emsp; {contractData.paymentMethod === '其他' ? '☑' : '□'} 其他</p>
                                            <p>12.甲方账户信息：</p>
                                            <div className="pl-4">
                                                <p>12.1.账户名称： {contractData.accountName}</p>
                                                <p>12.2.开户银行： {contractData.accountBank}</p>
                                                <p>12.3.银行账号： {contractData.accountNo}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rest of the contract text (truncated for UI preview to save space, but keeping structure) */}
                                    <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-center italic mb-2">-- 以下为通用条款，实际签署时将完整展示 --</p>
                                        <p>二、定义与基础...</p>
                                        <p>三、赠送会籍使用规则...</p>
                                        <p>四、冷静期与退费...</p>
                                        <p>五、预约、取消、爽约与迟到规则...</p>
                                        <p>六、会籍暂停（请假/冻结）与转卡...</p>
                                        <p>七、上课安全与行为规范...</p>
                                        <p>八、甲方的权利与义务...</p>
                                        <p>九、乙方的权利与义务...</p>
                                        <p>十、违约责任...</p>
                                        <p>十一、合同的解除与终止...</p>
                                        <p>十二、不可抗力...</p>
                                        <p>十三、争议解决...</p>
                                        <p>十四、附则...</p>
                                    </div>

                                    {/* Signatures */}
                                    <div ref={sectionRefs.signatures} className="mt-12 pt-8 border-t border-gray-200">
                                        <p className="mb-6">本页为签署页。乙方确认：甲方已采取合理方式（如加粗、下划线、特殊字体等）提请本人注意免除或限制其责任、涉及本人重大利益的条款，并已应本人要求对相关条款进行了说明。本人已充分理解本合同全部内容，自愿签署。</p>
                                        
                                        <div className="mb-8 space-y-2 font-bold">
                                            <p>【重要条款特别提示（请勾选）】</p>
                                            <p>☑ 乙方已知悉：本合同为固定期限服务合约；会籍期限届满后会籍权益到期失效。</p>
                                            <p>☑ 乙方已知悉：额度型会籍到期后剩余点数进入冻结状态（不清零、不兑现），可按本合同约定续费/付费激活，超过90天未激活的，权益永久作废。</p>
                                            <p>☑ 乙方已知悉：非冷静期退费需承担可退余额20% 的退费服务费（封顶人民币2,000元），并按本合同余额公式结算。</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <div className="font-bold">甲方（盖章）:</div>
                                                <div className="font-bold">法定代表人/授权代表（签字）:</div>
                                                <div className="relative h-24">
                                                    <div className="absolute top-0 left-0 w-24 h-24 border-4 border-red-500/30 rounded-full flex items-center justify-center text-red-500/30 font-bold text-[10px] rotate-12">
                                                        MetYoga 合同专用章
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">日期：{new Date().toLocaleDateString()}</div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="font-bold">乙方（签字）:</div>
                                                <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                                                    <span className="text-gray-300 text-xs italic">待会员在线签署...</span>
                                                </div>
                                                <div className="text-xs text-gray-400">日期：____年__月__日</div>
                                            </div>
                                        </div>
                                        <div className="mt-8 text-center text-gray-500">
                                            本合同签订于 浙江省 杭州市
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div ref={sectionRefs.partyB}>
                                        <div className="grid grid-cols-[80px_1fr_80px_1fr] gap-y-2">
                                            <span className="font-bold">甲方姓名：</span><span className="border-b border-gray-300">{selectedMember?.name || '________________'}</span>
                                            <span className="font-bold">性&emsp;&emsp;别：</span><span className="border-b border-gray-300">{selectedMember ? (selectedMember.gender === 'female' ? '女' : '男') : '________________'}</span>
                                            <span className="font-bold">出生日期：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                            <span className="font-bold">证件号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                            <span className="font-bold">手机号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                        </div>
                                    </div>

                                    <div ref={sectionRefs.partyA}>
                                        <div className="grid grid-cols-[140px_1fr] gap-y-2">
                                            <span className="font-bold">乙&emsp;&emsp;方：</span><span className="border-b border-gray-300">{contractData.partyACompany || '杭州茶瑜梵逅健康管理有限公司 （Met Yoga）'}</span>
                                            <span className="font-bold">统一社会信用代码：</span><span className="border-b border-gray-300">{contractData.partyACode || '91330101MA2J244726'}</span>
                                            <span className="font-bold">地&emsp;&emsp;址：</span><span className="border-b border-gray-300">{contractData.partyAAddress || '浙江省杭州市西湖风景名胜区四眼井 101 号'}</span>
                                            <span className="font-bold">联系电话：</span><span className="border-b border-gray-300">{contractData.partyAPhone || '19157979531'}</span>
                                        </div>
                                    </div>

                                    <p className="indent-8 mt-4">
                                        根据《中华人民共和国民法典》等法律、法规规定，甲乙双方在平等、友好协商一致的基础上， 就甲方自愿成为乙方学员由乙方提供 【瑜伽】教育培训服务 等事宜达成如下协议：
                                    </p>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-base">第一条 甲乙双方要求</h3>
                                        <div className="pl-4 space-y-2">
                                            <p className="font-bold">（一）学员资格确定</p>
                                            <p>1. 甲方是年满 18 周岁的具有完全民事行为能力人，具有良好身体状况，可以正常接受乙方提供的教培服务内容。</p>
                                            <p>2. 甲方应详细填写报名表中所列内容， 并保证填写信息的真实性、准确性及合法性。乙方依据甲方填写的信息确认甲方学员身份及享有的学员服务。如因甲方未正确填写而导致未能及时享受课程服务，由甲方承担相应责任，与乙方无关。</p>
                                            <p>3. 符合本协议条件并且办理学员登记后方可取得 Met Yoga 学员资格。</p>
                                            <p>即便存在前述约定， 乙方仍可按照实际情况最终确定甲方是否可以成为乙方学员（无论在协议开始履行前，还是协议履行中）。乙方依据本条款行使权利，不作为乙方违约。</p>
                                            
                                            <p className="font-bold mt-4">（二） 甲方健康保证</p>
                                            <p>甲方清楚了解本协议服务对身体状况的要求， 并保证身体状况良好， 无严重身体缺陷， 伤残或疾病， 可以无障碍履行本协议各项内容； 不存在任何无法使用乙方之全部设施及服务之情况。在本协议履行过程中， 甲方有任何健康或医护方面问题， 应立即自行停止相应培训， 并向医生问询就诊。康复后， 方可使用乙方设施及服务。</p>
                                            
                                            <p className="font-bold mt-4">（三） 乙方教培增值服务</p>
                                            <p>乙方为全美瑜伽联盟认证学校与由国家体育总局社会体育指导中心授权的五星级健身瑜伽场馆。学员培训期满后， 通过考核的， 可取得全美瑜伽联盟 RYT200 教练资格证书、国家体育总局颁发的三段段位证书。</p>
                                        </div>

                                        <div ref={sectionRefs.courseDetails}>
                                            <h3 className="font-bold text-base mt-6">第二条 教培服务内容</h3>
                                            <div className="pl-4 space-y-2">
                                                <p className="font-bold">（一）课程信息详情</p>
                                                <p>1. 课程名称： <span className="underline px-2">{contractData.ttcCourseName || 'RYT200 培训课程'}</span></p>
                                                <p>2. 课程预计开始时间： <span className="underline px-2">{contractData.startDate || '____年__月__日'}</span> 课程预计结束时间： <span className="underline px-2">{contractData.endDate || '____年__月__日'}</span></p>
                                                <p className="text-gray-500 text-xs">具体以甲方预报后经乙方确定开班的课期为准。因受人数及老师等资源限制， 学员课程在开班后不予调整。</p>
                                                <p>3. 授课地点： <span className="underline px-2">{contractData.partyAAddress || '浙江省杭州市西湖风景名胜区四眼井 101 号'}</span></p>
                                                
                                                <div ref={sectionRefs.payment}>
                                                    <p className="font-bold mt-4">（二）培训收费</p>
                                                    <p>1. 培训费用合计：人民币 <span className="underline px-2">{contractData.amount || '______'}</span> 元</p>
                                                    <p>2. 经甲乙双方协商，甲方采取以下方式付款：</p>
                                                    <div className="pl-4">
                                                        <p>{contractData.ttcPaymentType === '全款' ? '☑' : '□'} 全款： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '全款' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '全款' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '全款' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                        <p>{contractData.ttcPaymentType === '定金' ? '☑' : '□'} 定金： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '定金' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '定金' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '定金' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                        <p>{contractData.ttcPaymentType === '尾款' ? '☑' : '□'} 尾款： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '尾款' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '尾款' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '尾款' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-2">注意： 费用一经支付将不予退款。甲方对本课程的报名名额将保留至尾款支付到期付款日。如有特殊情况，在课程开始前 甲方提交退学的书面通知，可以退还所付的所有款项减去全款的 20 ％ 。 因课程学员人数及老师等资源已经确定， 在课程开始第 1 周以内 甲方要求退学， 将扣除全款的 30 ％；对于在第 1 周后但在课程的前 50%之内退学的，将扣除全款的 60%；对于完成课程的 50% 以上退学的， 将不予退款。</p>
                                                </div>

                                                <div ref={sectionRefs.leave}>
                                                    <p className="font-bold mt-4">（三）请假及课程报停</p>
                                                    <p>1. 在同一期课程内，甲方享有【 <span className="underline px-2">{contractData.ttcLeaveCount || '3'}</span> 】次请假，累计不超过 24 小时并由乙方提供补课的机会。 超出前述次数的，甲方必须以每小时 100 元安排补课才能从该课程毕业。</p>
                                                    <p>2. 如甲方因出国等原因暂时无法继续参加后期课程，可申请一次报停， 报停应以书面形式提前办理并取得乙方同意方可生效。报停后甲方可以恢复课程时应向乙方提出申请， 等待至乙方有同类课程到达甲方停课时程度时经乙方通知甲方后由甲方插入后期课程。</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
                                            <p className="text-center italic mb-2">-- 以下为通用条款，实际签署时将完整展示 --</p>
                                            <p>第三条 双方权利义务...</p>
                                            <p>第四条 培训服务转让...</p>
                                            <p>第五条 违约责任...</p>
                                            <p>第六条 特别约定...</p>
                                            <p>第七条 通知...</p>
                                            <p>第八条 争议解决...</p>
                                            <p>第九条 不可抗力...</p>
                                            <p>第十条 补充协议...</p>
                                            <p>第十一条 有效期限...</p>
                                            <p>第十二条 生效条件...</p>
                                        </div>

                                        {/* Signatures */}
                                        <div ref={sectionRefs.signatures} className="mt-12 pt-8 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-12">
                                                <div className="space-y-4">
                                                    <div className="font-bold">甲方（签字或盖章）:</div>
                                                    <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                                                        <span className="text-gray-300 text-xs italic">待学员在线签署...</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">日期：____年__月__日</div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="font-bold">乙方（签章）:</div>
                                                    <div className="relative h-24">
                                                        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-red-500/30 rounded-full flex items-center justify-center text-red-500/30 font-bold text-[10px] rotate-12">
                                                            MetYoga 合同专用章
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">日期：{new Date().toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] select-none overflow-hidden">
                            <div className="text-8xl font-black whitespace-nowrap">MetYoga PRO</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };



  return renderContractCreate();
};

export default MallContractCreate;
