
import React, { useEffect, useMemo, useState } from 'react';
import {
  MOCK_CARD_PRODUCTS,
  MOCK_CONTRACTS,
  MOCK_MEMBERS,
  MOCK_MEMBER_ASSETS,
  MOCK_ORDERS,
  MOCK_PAYMENTS,
  MOCK_POINT_PRODUCTS,
  MOCK_REFUNDS,
  MOCK_TTC_PRODUCTS,
} from '../constants';
import MallCards from './mall/MallCards';
import MallDataOverview from './mall/MallDataOverview';
import MallContractCreate, { createInitialContractData, type MallContractData } from './mall/MallContractCreate';
import MallAssetDetailDrawer from './mall/MallAssetDetailDrawer';
import MallFreezeRequestDrawer from './mall/MallFreezeRequestDrawer';
import MallOrderDetailDrawer from './mall/MallOrderDetailDrawer';
import MallRefundRequestDrawer from './mall/MallRefundRequestDrawer';
import MallOrders, { type MallOrderCategory, type MallOrderFilters } from './mall/MallOrders';
import MallPoints from './mall/MallPoints';
import MallTtc, { type MallTtcCourse, type Student, type TTCTutor, toMallTtcCourse } from './mall/MallTtc';
import type {
  CardEditCategory,
  MallActionType,
  MallActionButtonRenderer,
  MallDuplicableActionType,
  MallDuplicableItem,
  MallEditableItem,
  MallModule,
  MallSelectedItem,
  MallCardEditorItem,
  MallEditorSetter,
  MallPointEditorItem,
  MallSubView,
  MallTtcEditorItem,
  PointProductTab,
} from './mall/mallTypes';
import type {
  CardProduct,
  Contract,
  MallRefundRequestDraft,
  Member,
  MemberAsset,
  Order,
  Payment,
  PointProduct,
  Refund,
} from '../types';
import {
  buildMallAssetSourceLinks,
  buildMallClosureSummary,
  buildMallContractSourceSummary,
  buildMallProductOptions,
  buildMallWriteClosureDraft,
  type MallWriteClosureDraft,
} from '../utils/mallSelectors';
import {
  MALL_ORDER_SCENARIO_ASSETS,
  MALL_ORDER_SCENARIO_CONTRACTS,
  MALL_ORDER_SCENARIO_ORDERS,
  MALL_ORDER_SCENARIO_PAYMENTS,
  MALL_ORDER_SCENARIO_REFUNDS,
} from '../utils/mallOrderScenarioFixtures';
import {
  buildMemberAssetFromOrder,
  canGrantMemberAssetForOrder,
  resolveMallGrantProduct,
  selectGrantPaymentForOrder,
} from '../utils/mallAssetGrant';
import { getRefundRequestDraftKey } from '../utils/mallRefundRequest';

// --- Constants ---
const AVAILABLE_VENUES = ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆'];

interface MallActionHandlers {
  edit: (item: MallEditableItem, type: MallActionType) => void;
  duplicate: (item: MallDuplicableItem, type: MallDuplicableActionType) => void;
  toggleStatus: (item: MallEditableItem, type: MallActionType) => void;
}

type MallToast = {
  id: number;
  message: string;
  variant?: 'success' | 'warning';
};

const cloneMallItem = <T,>(item: T): T => JSON.parse(JSON.stringify(item)) as T;

const canDuplicateMallItem = (type: MallActionType): type is MallDuplicableActionType => type !== 'ttc_tutor';

const applyMallEditorUpdate = <T,>(
    prev: MallSelectedItem,
    value: T | null | ((current: T | null) => T | null)
): MallSelectedItem => {
    if (typeof value === 'function') {
        return (value as (current: T | null) => T | null)(prev as T | null) as MallSelectedItem;
    }
    return value as MallSelectedItem;
};

const MALL_MODULE_TABS: { id: MallModule; label: string }[] = [
  { id: 'cards', label: '会员卡项' },
  { id: 'ttc', label: '教培产品' },
  { id: 'points', label: '积分商品' },
  { id: 'orders', label: '销售订单' },
];

const Mall: React.FC = () => {
  const [activeModule, setActiveModule] = useState<MallModule>('cards');
  const [subView, setSubView] = useState<MallSubView>('list');
  const [selectedItem, setSelectedItem] = useState<MallSelectedItem>(null);
  const [editType, setEditType] = useState<MallActionType>('card');
  
  // Local state for toggling Card Category in Edit Mode
  const [editCardCategory, setEditCardCategory] = useState<CardEditCategory>('stored_value');
  const [pointProductTab, setPointProductTab] = useState<PointProductTab>('course');
  
  // Order Management State
  const [orderTab, setOrderTab] = useState<MallOrderCategory>('cards');
  const [orderFilters, setOrderFilters] = useState<MallOrderFilters>({ date: 'all', type: 'all', status: 'all' });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [refundRequestDrawer, setRefundRequestDrawer] = useState<{
    orderId: string;
    assetId?: string | null;
  } | null>(null);
  const [refundRequestDrafts, setRefundRequestDrafts] = useState<Record<string, MallRefundRequestDraft>>({});
  const [selectedFreezeAssetId, setSelectedFreezeAssetId] = useState<string | null>(null);
  const [isFreezeDrawerOpen, setIsFreezeDrawerOpen] = useState(false);

  // Contract Creation State
  const [contractData, setContractData] = useState<MallContractData>(() => createInitialContractData());
  const [toast, setToast] = useState<MallToast | null>(null);

  const showToast = (message: string, variant: 'success' | 'warning' = 'success') => {
      setToast({ id: Date.now(), message, variant });
      window.setTimeout(() => {
          setToast(current => (current?.message === message ? null : current));
      }, 2400);
  };

  // --- Mock Data ---  // --- Mock Data ---

  const [cards, setCards] = useState<CardProduct[]>(MOCK_CARD_PRODUCTS);

  const [ttcTutors, setTtcTutors] = useState<TTCTutor[]>([
      {
          id: 'tutor1', name: 'Master Sarah', title: 'E-RYT 500 认证导师', status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          motto: '瑜伽不是关于触碰脚趾，而是关于我们在路上的收获。',
          resume: [
              { year: '2006', title: '取得 Yoga Alliance 全美瑜伽联盟 E-RYT 500 最高级别认证，开启系统化教学之路。' },
              { year: '2010', title: '赴印度瑞诗凯诗进修哈他瑜伽传统精髓。' },
              { year: '2019', title: '创立 MET YOGA 品牌，并获得 DNS 临床康复认证（A），正式确立“正念觉知与现代运动解剖相融合”的科学教学根基。' }
          ],
          gallery: ['https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400']
      },
      {
          id: 'tutor2', name: 'Dr. Anna', title: '普拉提康复专家', status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
          motto: '控制身体，就是控制人生。',
          resume: [
              { year: '2015', title: '获得物理治疗学博士学位，专注于运动康复领域。' },
              { year: '2018', title: '完成 STOTT PILATES 全场馆器械认证。' }
          ],
          gallery: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400']
      }
  ]);

  const [ttcCourses, setTtcCourses] = useState<MallTtcCourse[]>(
      MOCK_TTC_PRODUCTS.map((product, index) => toMallTtcCourse(product, index, AVAILABLE_VENUES))
  );

  const [products, setProducts] = useState<PointProduct[]>(MOCK_POINT_PRODUCTS);

  const [students] = useState<Student[]>([
      { id: 'st1', name: 'Lisa Wang', phone: '138****8888', paymentStatus: 'paid', amount: 16800, confirmed: true, batch: '2024 春季周末班', signupDate: '2023-11-20' },
      { id: 'st2', name: 'Mike Chen', phone: '139****1234', paymentStatus: 'deposit', amount: 5000, confirmed: false, batch: '2024 春季周末班', signupDate: '2023-11-22' },
  ]);

  const mergedOrders = useMemo(() => [...MOCK_ORDERS, ...MALL_ORDER_SCENARIO_ORDERS], []);
  const mergedContracts = useMemo(() => [...MOCK_CONTRACTS, ...MALL_ORDER_SCENARIO_CONTRACTS], []);
  const mergedPayments = useMemo(() => [...MOCK_PAYMENTS, ...MALL_ORDER_SCENARIO_PAYMENTS], []);
  const mergedRefunds = useMemo(() => [...MOCK_REFUNDS, ...MALL_ORDER_SCENARIO_REFUNDS], []);
  const mergedMemberAssets = useMemo(() => [...MOCK_MEMBER_ASSETS, ...MALL_ORDER_SCENARIO_ASSETS], []);

  const [orders, setOrders] = useState<Order[]>(mergedOrders);
  const [contracts, setContracts] = useState<Contract[]>(mergedContracts);
  const [memberAssets, setMemberAssets] = useState<MemberAsset[]>(mergedMemberAssets);
  const [payments] = useState<Payment[]>(mergedPayments);
  const [refunds] = useState<Refund[]>(mergedRefunds);
  const [writeClosureDraft, setWriteClosureDraft] = useState<MallWriteClosureDraft | null>(null);
  const mallProductOptions = useMemo(
      () => buildMallProductOptions({ cards, ttcCourses, pointProducts: products }),
      [cards, ttcCourses, products]
  );
  const assetSourceLinks = useMemo(
      () => buildMallAssetSourceLinks({
          assets: memberAssets,
          orders,
          contracts,
      }),
      [memberAssets, orders, contracts]
  );
  const contractSourceSummary = useMemo(
      () => buildMallContractSourceSummary({
          contractData,
          members: MOCK_MEMBERS,
          productOptions: mallProductOptions,
      }),
      [contractData, mallProductOptions]
  );
  const mallClosureSummary = useMemo(
      () => buildMallClosureSummary({ orders, assetSourceLinks }),
      [orders, assetSourceLinks]
  );

  const openOrderDetailDrawer = (orderId: string) => {
      setSelectedOrderId(orderId);
      setIsOrderDrawerOpen(true);
  };

  const closeOrderDetailDrawer = () => {
      setIsOrderDrawerOpen(false);
      setSelectedOrderId(null);
  };

  const openAssetDetail = (assetId: string) => {
      setSelectedAssetId(assetId);
      setIsAssetDrawerOpen(true);
  };

  const closeAssetDetail = () => {
      setIsAssetDrawerOpen(false);
      setSelectedAssetId(null);
      setIsFreezeDrawerOpen(false);
      setSelectedFreezeAssetId(null);
  };

  const openFreezeRequestDrawer = (assetId: string) => {
      setSelectedFreezeAssetId(assetId);
      setIsFreezeDrawerOpen(true);
  };

  const closeFreezeRequestDrawer = () => {
      setIsFreezeDrawerOpen(false);
      setSelectedFreezeAssetId(null);
  };

  const openRefundRequestDrawer = (payload: { orderId: string; assetId?: string | null }) => {
      setRefundRequestDrawer(payload);
  };

  const closeRefundRequestDrawer = () => {
      setRefundRequestDrawer(null);
  };

  const handleSaveRefundRequestDraft = (draft: MallRefundRequestDraft) => {
      const key = getRefundRequestDraftKey(draft.orderId, draft.assetId);
      setRefundRequestDrafts(prev => ({ ...prev, [key]: draft }));
      showToast(
          '退款申请草稿已保存。本记录仅保存在产品与合同模块内，正式提交需接入审批、资产处理、财务记录与操作日志。',
          'success'
      );
  };

  const refundDrawerDraftKey = refundRequestDrawer
      ? getRefundRequestDraftKey(refundRequestDrawer.orderId, refundRequestDrawer.assetId)
      : null;
  const refundDrawerExistingDraft =
      refundDrawerDraftKey && refundRequestDrafts[refundDrawerDraftKey]
          ? refundRequestDrafts[refundDrawerDraftKey]
          : null;

  const orderRefundDraftKey =
      selectedOrderId !== null ? getRefundRequestDraftKey(selectedOrderId, null) : null;
  const orderRefundDraftSavedAt =
      orderRefundDraftKey && refundRequestDrafts[orderRefundDraftKey]
          ? refundRequestDrafts[orderRefundDraftKey].updatedAt
          : null;

  const assetDraftHintAsset =
      selectedAssetId !== null ? memberAssets.find(a => a.id === selectedAssetId) : undefined;
  const assetRefundDraftKey =
      assetDraftHintAsset?.sourceOrderId
          ? getRefundRequestDraftKey(assetDraftHintAsset.sourceOrderId, assetDraftHintAsset.id)
          : null;
  const assetRefundDraftSavedAt =
      assetRefundDraftKey && refundRequestDrafts[assetRefundDraftKey]
          ? refundRequestDrafts[assetRefundDraftKey].updatedAt
          : null;

  const handleGrantMemberAssetForOrder = (orderId: string) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
          showToast('未找到订单信息，暂不可生成资产记录。', 'warning');
          return;
      }
      const membersList: Member[] = MOCK_MEMBERS;
      const gate = canGrantMemberAssetForOrder({
          order,
          contracts,
          payments,
          refunds,
          memberAssets,
          members: membersList,
          cardProducts: cards,
          ttcProducts: ttcCourses,
          pointProducts: products,
      });
      if (!gate.allowed) {
          showToast(gate.reason, 'warning');
          return;
      }
      const contract =
          contracts.find(c => c.id === order.contractId) ?? contracts.find(c => c.orderId === order.id);
      const payment = selectGrantPaymentForOrder(order, payments);
      const member = membersList.find(m => m.id === order.memberId);
      const product = resolveMallGrantProduct(order, cards, ttcCourses, products);
      if (!contract || !payment || !member || !product) {
          showToast('暂不满足生成条件，请刷新后重试。', 'warning');
          return;
      }
      const newAsset = buildMemberAssetFromOrder({ order, contract, payment, product, member });
      setMemberAssets(prev => [...prev, newAsset]);
      showToast('已在产品与合同模块生成会员资产记录。会员经营同步与财务证据链需后续接入统一服务。', 'success');
  };

  useEffect(() => {
      setWriteClosureDraft(null);
  }, [
      contractData.memberId,
      contractData.productId,
      contractData.productType,
      contractData.amount,
      contractData.startDate,
      contractData.endDate,
  ]);

  const setCardSelectedItem: MallEditorSetter<MallCardEditorItem> = (value) => {
      setSelectedItem(prev => applyMallEditorUpdate(prev, value));
  };

  const setTtcSelectedItem: MallEditorSetter<MallTtcEditorItem> = (value) => {
      setSelectedItem(prev => applyMallEditorUpdate(prev, value));
  };

  const setPointSelectedItem: MallEditorSetter<MallPointEditorItem> = (value) => {
      setSelectedItem(prev => applyMallEditorUpdate(prev, value));
  };

  // --- Helpers ---
  const handleEdit = (item: MallEditableItem, type: MallActionType) => {
      const deepCopy = cloneMallItem(item) as MallSelectedItem & {
          resume?: unknown[];
          planNodes?: unknown[];
          audienceNodes?: unknown[];
          listingVenues?: string[];
      };
      // Init new fields if undefined (for data migration safety)
      if (type === 'ttc_tutor' && !deepCopy.resume) deepCopy.resume = [];
      if (type === 'ttc_course' && !deepCopy.planNodes) deepCopy.planNodes = [];
      if (type === 'ttc_course' && !deepCopy.audienceNodes) deepCopy.audienceNodes = [];
      if (!deepCopy.listingVenues && type !== 'ttc_tutor') deepCopy.listingVenues = [];
      
      setSelectedItem(deepCopy); 
      setEditType(type);
      if (type === 'card') setEditCardCategory((item as CardProduct).type || 'stored_value');
      setSubView('edit'); 
  };

  const handleCreate = (type: MallActionType) => {
      // Set empty structure for new items
      const newItem: MallSelectedItem = type === 'ttc_tutor' ? { resume: [], gallery: [] }
        : type === 'ttc_course' ? { planNodes: [], audienceNodes: [], schedules: [] }
        : type === 'card' ? { 
            type: 'stored_value', name: '', slogan: '', guide: '', price: 0, 
            validity: 12, validityUnit: 'month', unitPrice: 0, bookingRange: 0,
            cancelFreeLimit: 0, cancelDeductPoints: 0, noShowDeductCurrent: false, noShowFreezeDays: 0,
            minOpenPeople: 0, checkInPoints: 0, checkInPointsPercent: 0, checkInDailyLimit: 0,
            scope: 'all', functionScope: [], leaveMinDays: 0, leaveMaxDays: 0, canExtend: false
        }
        : type === 'product' ? {
            type: pointProductTab, // Use current tab as default type
            name: '', cover: '', description: '',
            enablePurePoints: true, purePointsPrice: 0,
            enableMixedPayment: false, mixedPointsPrice: 0, mixedCashPrice: 0,
            status: 'active', venues: [],
            exchangeCount: 0, inventoryUsage: 0, recentExchanges: []
        }
        : null;

      setSelectedItem(newItem); 
      setEditType(type);
      if (type === 'card') setEditCardCategory('stored_value'); 
      setSubView('edit'); 
  };

  const handleDuplicate = (item: MallDuplicableItem, type: MallDuplicableActionType) => {
      if (type === 'card') {
          const newItem = cloneMallItem(item as CardProduct);
          setCards([{ ...newItem, id: `card_copy_${Date.now()}`, name: `${newItem.name} (复制)`, status: 'inactive' }, ...cards]);
      }
      if (type === 'ttc_course') {
          const newItem = cloneMallItem(item as MallTtcCourse);
          setTtcCourses([{ ...newItem, id: `ttc_copy_${Date.now()}`, name: `${newItem.name} (复制)`, status: 'inactive' }, ...ttcCourses]);
      }
      if (type === 'product') {
          const newItem = cloneMallItem(item as PointProduct);
          setProducts([{ ...newItem, id: `product_copy_${Date.now()}`, name: `${newItem.name} (复制)`, status: 'inactive' }, ...products]);
      }
  };

  const handleToggleStatus = (item: MallEditableItem, type: MallActionType) => {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      if (type === 'card') setCards(cards.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_course') setTtcCourses(ttcCourses.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_tutor') setTtcTutors(ttcTutors.map(t => t.id === item.id ? {...t, status: newStatus} : t));
      if (type === 'product') setProducts(products.map(p => p.id === item.id ? {...p, status: newStatus} : p));
  };

  const handleBack = () => { setSubView('list'); setSelectedItem(null); };
  const handleViewStudents = (item: MallTtcCourse) => { setSelectedItem(item); setSubView('students'); };
  const openContractCreate = () => {
      setContractData(prev => ({...prev, productType: activeModule === 'ttc' ? 'ttc' : 'card'}));
      setSubView('contract_create');
  };

  const handleSaveContractDraft = () => {
      showToast(`${contractSourceSummary.productName} 合同草稿已保存为前端草稿，后端持久化仍待接入`);
  };

  const handleGenerateOrderPreview = () => {
      const draft = buildMallWriteClosureDraft({
          contractData,
          members: MOCK_MEMBERS,
          productOptions: mallProductOptions,
          existingOrders: orders,
      });

      if (!draft) {
          showToast('请先选择会员、关联商品并填写合同金额，再生成订单预览');
          return;
      }

      setWriteClosureDraft(draft);
      showToast(`${draft.member.name} 的 ${draft.product.name} 已生成订单、合同与资产预览，请在预览区核对后再确认`);
  };

  const handleConfirmOrderPreview = () => {
      if (!writeClosureDraft) {
          showToast('请先生成订单预览');
          return;
      }

      setOrders(current => [writeClosureDraft.order, ...current]);
      setContracts(current => [writeClosureDraft.contract, ...current]);
      setMemberAssets(current => [writeClosureDraft.asset, ...current]);
      setOrderTab(writeClosureDraft.product.sourceType === 'ttc' ? 'ttc' : 'cards');
      setActiveModule('orders');
      setSubView('list');
      showToast('已生成产品与合同模块内的订单、合同草稿与资产记录。支付记录、会员经营同步与财务入账需后续接入统一服务。');
      setWriteClosureDraft(null);
      setContractData(createInitialContractData());
  };

  // --- Charts Data ---
  const salesTrendData = [ {name: 'M1', val: 40}, {name: 'M2', val: 30}, {name: 'M3', val: 55}, {name: 'M4', val: 45}, {name: 'M5', val: 60} ];
  const funnelData = [ {name: '浏览', value: 1000}, {name: '咨询', value: 400}, {name: '报名', value: 80}, {name: '全款', value: 65} ];

  // ================= RENDERERS =================

  // --- Shared Action Buttons Component ---
  const mallActionHandlers: MallActionHandlers = {
      edit: handleEdit,
      duplicate: handleDuplicate,
      toggleStatus: handleToggleStatus,
  };

  const ActionButtons = ({ item, type, handlers }: { item: MallEditableItem, type: MallActionType, handlers: MallActionHandlers }) => (
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); handlers.edit(item, type); }}
            className="met-secondary-button flex-1 text-xs py-2"
          >
              编辑
          </button>
          {canDuplicateMallItem(type) && (
              <button 
                  onClick={(e) => { e.stopPropagation(); handlers.duplicate(item as MallDuplicableItem, type); }}
                  className="met-secondary-button flex-1 text-xs py-2"
              >
                  复制
              </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handlers.toggleStatus(item, type); }}
            className={`flex-1 border text-xs py-2 rounded-lg font-bold transition ${
                item.status === 'active' 
                ? 'bg-white border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200' 
                : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
            }`}
          >
              {item.status === 'active' ? '下架' : '上架'}
          </button>
      </div>
  );

  const renderActionButtons: MallActionButtonRenderer = (item, type) => (
      <ActionButtons item={item} type={type} handlers={mallActionHandlers} />
  );

  const renderMallCards = (view: 'list' | 'edit') => (
      <MallCards
          view={view}
          cards={cards}
          setCards={setCards}
          selectedItem={selectedItem}
          setSelectedItem={setCardSelectedItem}
          editCardCategory={editCardCategory}
          setEditCardCategory={setEditCardCategory}
          overview={<MallDataOverview moduleType="cards" venues={AVAILABLE_VENUES} closureSummary={mallClosureSummary} onDemoAction={showToast} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreate={handleCreate}
          salesTrendData={salesTrendData}
          availableVenues={AVAILABLE_VENUES}
      />
  );

  const renderMallTtc = (view: 'list' | 'edit' | 'students') => (
      <MallTtc
          view={view}
          ttcCourses={ttcCourses}
          ttcTutors={ttcTutors}
          editType={editType}
          selectedItem={selectedItem}
          setSelectedItem={setTtcSelectedItem}
          students={students}
          overview={<MallDataOverview moduleType="ttc" venues={AVAILABLE_VENUES} closureSummary={mallClosureSummary} onDemoAction={showToast} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreate={handleCreate}
          handleViewStudents={handleViewStudents}
          availableVenues={AVAILABLE_VENUES}
          funnelData={funnelData}
          onDemoAction={showToast}
      />
  );

  const renderMallPoints = (view: 'list' | 'edit') => (
      <MallPoints
          view={view}
          products={products}
          setProducts={setProducts}
          selectedItem={selectedItem}
          setSelectedItem={setPointSelectedItem}
          pointProductTab={pointProductTab}
          setPointProductTab={setPointProductTab}
          overview={<MallDataOverview moduleType="points" venues={AVAILABLE_VENUES} closureSummary={mallClosureSummary} onDemoAction={showToast} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreateProduct={() => handleCreate('product')}
          availableVenues={AVAILABLE_VENUES}
      />
  );

  const renderMallOrders = () => (
      <MallOrders
          orders={orders}
          contracts={contracts}
          members={MOCK_MEMBERS}
          assetSourceLinks={assetSourceLinks}
          orderTab={orderTab}
          setOrderTab={setOrderTab}
          orderFilters={orderFilters}
          setOrderFilters={setOrderFilters}
          onDemoAction={showToast}
          onOpenOrderDetail={openOrderDetailDrawer}
          onOpenAssetDetail={openAssetDetail}
      />
  );

  const renderMallContractCreate = () => (
      <MallContractCreate
          contractData={contractData}
          setContractData={setContractData}
          members={MOCK_MEMBERS}
          productOptions={mallProductOptions}
          sourceSummary={contractSourceSummary}
          writeClosureDraft={writeClosureDraft}
          handleBack={handleBack}
          onDemoAction={showToast}
          onSaveDraft={handleSaveContractDraft}
          onGenerateOrderPreview={handleGenerateOrderPreview}
          onConfirmOrderPreview={handleConfirmOrderPreview}
      />
  );
  
  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4"><h2 className="text-xl font-bold text-gray-900">产品与合同</h2></div>
            {subView === 'list' && (
                <div className="flex items-center gap-4">
                    <div className="relative"><i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i><input type="text" placeholder={`搜索${activeModule === 'cards' ? '卡项' : activeModule === 'ttc' ? '课程' : '商品'}...`} className="pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg text-xs w-64 transition-all outline-none" /></div>
                    
                    {(activeModule === 'cards' || activeModule === 'ttc') && (
                        <div className="relative group">
                            <button className="bg-white border border-gray-200 text-gray-900 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                                <i className="fa-solid fa-file-signature text-orange-500"></i> 合同管理
                                <i className="fa-solid fa-chevron-down text-gray-400 ml-1 text-[10px]"></i>
                            </button>
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                <button 
                                    onClick={openContractCreate}
                                    className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-pen-nib w-4 text-center"></i> 在线发起
                                </button>
                                <button 
                                    onClick={() => document.getElementById('contract-upload')?.click()}
                                    className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2 border-t border-gray-50"
                                >
                                    <i className="fa-solid fa-upload w-4 text-center"></i> 上传文件
                                </button>
                            </div>
                            <input 
                                type="file" 
                                id="contract-upload" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        showToast('合同文件上传功能待接入，正式版本需绑定会员、订单、合同与操作日志。');
                                        e.target.value = '';
                                    }
                                }} 
                            />
                        </div>
                    )}

                    {activeModule !== 'orders' && (<button type="button" onClick={() => handleCreate(activeModule === 'cards' ? 'card' : activeModule === 'ttc' ? 'ttc_course' : 'product')} className="met-primary-button text-xs">+ 新建{activeModule === 'cards' ? '卡项' : activeModule === 'ttc' ? '课程' : '商品'}</button>)}
                </div>
            )}
        </div>

        {/* Sub Nav */}
        {subView === 'list' && (
            <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                    {MALL_MODULE_TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveModule(tab.id)} className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${activeModule === tab.id ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'}`}>{tab.label}</button>
                    ))}
                </div>
            </div>
        )}

        {/* Content */}
        <div className={`flex-1 p-8 custom-scroll ${subView === 'contract_create' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
            <div className={`max-w-[1440px] mx-auto w-full ${subView === 'contract_create' ? 'flex-1 flex flex-col min-h-0' : 'min-h-[500px]'}`}>
                {subView === 'list' && (
                    <>
                        {activeModule === 'cards' && renderMallCards('list')}
                        {activeModule === 'ttc' && renderMallTtc('list')}
                        {activeModule === 'points' && renderMallPoints('list')}
                        {activeModule === 'orders' && renderMallOrders()}
                    </>
                )}
                {subView === 'edit' && activeModule === 'cards' && renderMallCards('edit')}
                {subView === 'edit' && activeModule === 'ttc' && renderMallTtc('edit')}
                {subView === 'edit' && activeModule === 'points' && renderMallPoints('edit')}
                {subView === 'students' && activeModule === 'ttc' && renderMallTtc('students')}
                {subView === 'contract_create' && renderMallContractCreate()}
            </div>
        </div>

        {isOrderDrawerOpen && (
            <MallOrderDetailDrawer
                open={isOrderDrawerOpen}
                orderId={selectedOrderId}
                onClose={closeOrderDetailDrawer}
                orders={orders}
                contracts={contracts}
                payments={payments}
                refunds={refunds}
                memberAssets={memberAssets}
                members={MOCK_MEMBERS}
                cardProducts={cards}
                ttcCourses={ttcCourses}
                pointProducts={products}
                onGrantMemberAssetForOrder={handleGrantMemberAssetForOrder}
                onOpenAssetDetail={openAssetDetail}
                onOpenRefundRequest={openRefundRequestDrawer}
                refundRequestDraftSavedAt={orderRefundDraftSavedAt}
            />
        )}

        {isAssetDrawerOpen && (
            <MallAssetDetailDrawer
                open={isAssetDrawerOpen}
                assetId={selectedAssetId}
                onClose={closeAssetDetail}
                orders={orders}
                contracts={contracts}
                payments={payments}
                refunds={refunds}
                memberAssets={memberAssets}
                members={MOCK_MEMBERS}
                onOpenRefundRequest={openRefundRequestDrawer}
                refundRequestDraftSavedAt={assetRefundDraftSavedAt}
                onOpenFreezeRequest={openFreezeRequestDrawer}
            />
        )}

        {isFreezeDrawerOpen && selectedFreezeAssetId && (
            <MallFreezeRequestDrawer
                open={isFreezeDrawerOpen}
                assetId={selectedFreezeAssetId}
                onClose={closeFreezeRequestDrawer}
                orders={orders}
                contracts={contracts}
                payments={payments}
                refunds={refunds}
                memberAssets={memberAssets}
                members={MOCK_MEMBERS}
            />
        )}

        {refundRequestDrawer && (
            <MallRefundRequestDrawer
                open
                orderId={refundRequestDrawer.orderId}
                assetId={refundRequestDrawer.assetId}
                onClose={closeRefundRequestDrawer}
                onSaveDraft={handleSaveRefundRequestDraft}
                existingDraft={refundDrawerExistingDraft}
                orders={orders}
                contracts={contracts}
                payments={payments}
                refunds={refunds}
                memberAssets={memberAssets}
                members={MOCK_MEMBERS}
            />
        )}

        {toast && (
            <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
                <div
                    className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                        toast.variant === 'warning'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-green-50 text-green-700 border-green-100'
                    }`}
                >
                    <i
                        className={
                            toast.variant === 'warning' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check'
                        }
                    ></i>
                    {toast.message}
                </div>
            </div>
        )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Mall;
