import React, { useState, useEffect } from 'react';
import { ApiService, wsClient } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { FleetOverview } from './components/dashboard/FleetOverview';
import { DeviceList } from './components/devices/DeviceList';
import { DeviceDetail } from './components/devices/DeviceDetail';
import { IncidentQueue } from './components/incidents/IncidentQueue';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { MlAnomaliesHub } from './components/ml/MlAnomaliesHub';
import { PkiDashboard } from './components/pki/PkiDashboard';
import { FirmwareCenter } from './components/firmware/FirmwareCenter';
import { SchemaEditor } from './components/schemas/SchemaEditor';
import { AttackSandbox } from './components/simulator/AttackSandbox';
import { AuditExplorer } from './components/audit/AuditExplorer';
import { LandingPage } from './components/landing/LandingPage';
import { Modal } from './components/common/Modal';
import {
  FleetStats,
  Device,
  Site,
  DeviceType,
  Incident,
  SecurityEvent,
  AnomalyEvent
} from './types';
import { ArrowLeft } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLandingView, setIsLandingView] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [anomalyEvents, setAnomalyEvents] = useState<AnomalyEvent[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Deep Dive Inspector States
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceDetailData, setDeviceDetailData] = useState<any>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentDetailData, setIncidentDetailData] = useState<any>(null);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

  // Load initial global data
  const loadGlobalData = async () => {
    try {
      const [st, devs, sts, types, incs, secEvs, anomEvs] = await Promise.all([
        ApiService.getFleetStats(),
        ApiService.getDevices(),
        ApiService.getSites(),
        ApiService.getDeviceTypes(),
        ApiService.getIncidents(),
        ApiService.getSecurityEvents(),
        ApiService.getAnomalyEvents()
      ]);
      setStats(st);
      setDevices(devs);
      setSites(sts);
      setDeviceTypes(types);
      setIncidents(incs);
      setSecurityEvents(secEvs);
      setAnomalyEvents(anomEvs);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadGlobalData();

    // Connect WebSocket
    wsClient.connect();
    setWsConnected(true);

    const unsubscribe = wsClient.subscribe((type, data) => {
      if (type === 'CONNECTED') {
        setWsConnected(true);
      } else if (type === 'TELEMETRY_STREAM') {
        // Incrementally refresh stats and details if on current device
        if (selectedDeviceId === data.deviceId) {
          ApiService.getDeviceDetail(data.deviceId).then(setDeviceDetailData);
        }
      } else if (type === 'DEVICE_CONNECTED' || type === 'SECURITY_EVENT') {
        loadGlobalData();
      }
    });

    // Periodic poll for stats
    const interval = setInterval(loadGlobalData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [selectedDeviceId]);

  // Load Device Detail on selection
  useEffect(() => {
    if (selectedDeviceId) {
      ApiService.getDeviceDetail(selectedDeviceId).then(setDeviceDetailData);
    } else {
      setDeviceDetailData(null);
    }
  }, [selectedDeviceId]);

  // Load Incident Detail on selection
  useEffect(() => {
    if (selectedIncidentId) {
      ApiService.getIncidentDetail(selectedIncidentId).then(setIncidentDetailData);
    } else {
      setIncidentDetailData(null);
    }
  }, [selectedIncidentId]);

  // Handlers
  const handleDeviceStateChange = async (deviceId: string, state: string, reason?: string) => {
    await ApiService.updateDeviceState(deviceId, state, reason, currentUser.email);
    await loadGlobalData();
    if (selectedDeviceId === deviceId) {
      const updated = await ApiService.getDeviceDetail(deviceId);
      setDeviceDetailData(updated);
    }
  };

  const handleProvisionDevice = async (payload: any) => {
    await ApiService.provisionDevice({ ...payload, actorEmail: currentUser.email });
    await loadGlobalData();
  };

  const handleSaveDesiredShadow = async (desired: Record<string, any>) => {
    if (!selectedDeviceId) return;
    await ApiService.updateDeviceShadow(selectedDeviceId, desired, currentUser.email);
    const updated = await ApiService.getDeviceDetail(selectedDeviceId);
    setDeviceDetailData(updated);
  };

  const handleRotateCert = async () => {
    if (!selectedDeviceId) return;
    await ApiService.rotateCertificate(selectedDeviceId, currentUser.email);
    const updated = await ApiService.getDeviceDetail(selectedDeviceId);
    setDeviceDetailData(updated);
    await loadGlobalData();
  };

  const handleRevokeCert = async () => {
    if (!selectedDeviceId || !deviceDetailData?.certificate) return;
    await ApiService.revokeCertificate(deviceDetailData.certificate.serialNumber, 'KEY_COMPROMISE', currentUser.email);
    const updated = await ApiService.getDeviceDetail(selectedDeviceId);
    setDeviceDetailData(updated);
    await loadGlobalData();
  };

  const handleExecuteAction = async (actionType: any, forceApproval?: boolean) => {
    if (!selectedIncidentId) return;
    const res = await ApiService.executeIncidentAction(selectedIncidentId, actionType, currentUser, forceApproval);
    const updated = await ApiService.getIncidentDetail(selectedIncidentId);
    setIncidentDetailData(updated);
    await loadGlobalData();
    return res;
  };

  const handleApproveAction = async (actionId: string) => {
    if (!selectedIncidentId) return;
    await ApiService.approveGatedAction(selectedIncidentId, actionId, currentUser);
    const updated = await ApiService.getIncidentDetail(selectedIncidentId);
    setIncidentDetailData(updated);
    await loadGlobalData();
  };

  const handleAddComment = async (comment: string) => {
    if (!selectedIncidentId) return;
    await ApiService.addIncidentComment(selectedIncidentId, comment, currentUser);
    const updated = await ApiService.getIncidentDetail(selectedIncidentId);
    setIncidentDetailData(updated);
  };

  const handleUpdateIncidentStatus = async (status: string, rootCause?: string) => {
    if (!selectedIncidentId) return;
    await ApiService.updateIncidentStatus(selectedIncidentId, status, rootCause, currentUser.email);
    const updated = await ApiService.getIncidentDetail(selectedIncidentId);
    setIncidentDetailData(updated);
    await loadGlobalData();
  };

  return (
    <div className="min-h-screen bg-[#111614] text-[#F4F2EC] flex flex-col font-sans selection:bg-[#CC5833]/30 selection:text-[#F4F2EC]">
      {isLandingView ? (
        <LandingPage
          onEnterApp={(tab) => {
            if (tab) setActiveTab(tab);
            setIsLandingView(false);
          }}
          stats={stats}
          wsConnected={wsConnected}
        />
      ) : (
        <>
          <Navbar
            stats={stats}
            wsConnected={wsConnected}
            onOpenSimulator={() => setIsSimulatorModalOpen(true)}
            onGoToLanding={() => setIsLandingView(true)}
          />

          <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full pt-2 pb-8">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setSelectedDeviceId(null);
                setSelectedIncidentId(null);
              }}
              stats={stats}
              onGoToLanding={() => setIsLandingView(true)}
            />

            <main className="flex-1 p-3 sm:p-6 w-full space-y-6">
              {/* SOC Fleet Overview */}
              {activeTab === 'overview' && (
                <FleetOverview
                  stats={stats}
                  sites={sites}
                  securityEvents={securityEvents}
                  anomalyEvents={anomalyEvents}
                  onSelectSite={(siteId) => {
                    setActiveTab('devices');
                  }}
                  onSelectDevice={(deviceId) => {
                    setSelectedDeviceId(deviceId);
                    setActiveTab('devices');
                  }}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* Device Registry or Detail */}
              {activeTab === 'devices' && (
                selectedDeviceId && deviceDetailData ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedDeviceId(null)}
                      className="magnetic-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171C19] hover:bg-[#1E2622] text-[#30D158] text-xs font-semibold border border-[#26372E] shadow-sm transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Device Master Registry</span>
                    </button>
                    <DeviceDetail
                      device={deviceDetailData.device}
                      deviceType={deviceDetailData.deviceType}
                      site={deviceDetailData.site}
                      certificate={deviceDetailData.certificate}
                      shadow={deviceDetailData.shadow}
                      recentTelemetry={deviceDetailData.recentTelemetry || []}
                      anomalies={deviceDetailData.anomalies || []}
                      securityEvents={deviceDetailData.securityEvents || []}
                      onStateChange={(st, reason) => handleDeviceStateChange(selectedDeviceId, st, reason)}
                      onSaveDesiredShadow={handleSaveDesiredShadow}
                      onRotateCert={handleRotateCert}
                      onRevokeCert={handleRevokeCert}
                    />
                  </div>
                ) : (
                  <DeviceList
                    devices={devices}
                    sites={sites}
                    deviceTypes={deviceTypes}
                    onSelectDevice={(id) => setSelectedDeviceId(id)}
                    onStateChange={handleDeviceStateChange}
                    onProvisionDevice={handleProvisionDevice}
                  />
                )
              )}

              {/* Incidents Queue or Detail */}
              {activeTab === 'incidents' && (
                selectedIncidentId && incidentDetailData ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedIncidentId(null)}
                      className="magnetic-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171C19] hover:bg-[#1E2622] text-[#CC5833] text-xs font-semibold border border-[#26372E] shadow-sm transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Incident Case Queue</span>
                    </button>
                    <IncidentDetail
                      incident={incidentDetailData.incident}
                      device={incidentDetailData.device}
                      securityEvents={incidentDetailData.securityEvents || []}
                      anomalyEvents={incidentDetailData.anomalyEvents || []}
                      onExecuteAction={handleExecuteAction}
                      onApproveAction={handleApproveAction}
                      onAddComment={handleAddComment}
                      onUpdateStatus={handleUpdateIncidentStatus}
                    />
                  </div>
                ) : (
                  <IncidentQueue
                    incidents={incidents}
                    sites={sites}
                    onSelectIncident={(id) => setSelectedIncidentId(id)}
                    onCreateIncident={async (payload) => {
                      await ApiService.createIncident({ ...payload, actorEmail: currentUser.email });
                      await loadGlobalData();
                    }}
                  />
                )
              )}

              {/* Tier 2 ML Anomaly Explorer */}
              {activeTab === 'ml-anomalies' && (
                <MlAnomaliesHub
                  onSelectDevice={(deviceId) => {
                    setSelectedDeviceId(deviceId);
                    setActiveTab('devices');
                  }}
                />
              )}

              {/* PKI & Certificate Authority */}
              {activeTab === 'pki' && <PkiDashboard />}

              {/* Firmware & OTA Lifecycle */}
              {activeTab === 'firmware' && <FirmwareCenter />}

              {/* Dynamic Telemetry Schemas */}
              {activeTab === 'schemas' && <SchemaEditor />}

              {/* Interactive Attack Sandbox */}
              {activeTab === 'sandbox' && <AttackSandbox />}

              {/* Immutable Audit Ledger */}
              {activeTab === 'audit' && <AuditExplorer />}
            </main>
          </div>

          {/* Attack Sandbox Floating Modal */}
          <Modal
            isOpen={isSimulatorModalOpen}
            onClose={() => setIsSimulatorModalOpen(false)}
            title="Interactive Attack & Anomaly Sandbox"
            subtitle="Simulate realistic sensor drift, credential cloning, topic spoofing, and spikes in real time"
            maxWidth="4xl"
          >
            <AttackSandbox />
          </Modal>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
