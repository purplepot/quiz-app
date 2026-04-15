export const MODULES = [
  {
    id: 1,
    title: "Module 1 - Networking Principles and Layered Architecture",
    description:
      "Data Communications Model, Network Topology, Protocols and Standards, OSI and TCP/IP Models",
    hours: 6,
  },
  {
    id: 2,
    title: "Module 2 - Circuit and Packet Switching",
    description:
      "Switched Communications, Network Software, Transmission Impairment, Data Rate and Performance",
    hours: 7,
  },
  {
    id: 3,
    title: "Module 3 - Data Link Layer",
    description:
      "Error Detection/Correction, Flow Control, Multiple Access, IEEE Standards (Ethernet, WLAN), RFID, Bluetooth",
    hours: 8,
  },
  {
    id: 4,
    title: "Module 4 - Network Layer",
    description:
      "IPv4/IPv6 Addressing, NAT, IPv4 and IPv6 Header Format, Classful and Classless Addressing",
    hours: 8,
  },
  {
    id: 5,
    title: "Module 5 - Routing Protocols",
    description:
      "Link State and Distance Vector Routing, Performance Analysis, Packet Tracer",
    hours: 6,
  },
  {
    id: 6,
    title: "Module 6 - Transport Layer",
    description:
      "TCP and UDP, Congestion Control, Traffic Management, QoS Parameters",
    hours: 5,
  },
  {
    id: 7,
    title: "Module 7 - Application Layer",
    description: "DNS, FTP, HTTP, SMTP, SNMP",
    hours: 3,
  },
];

export function getModuleTitle(moduleId: number | string): string {
  const module = MODULES.find((m) => m.id === Number(moduleId));
  return module?.title || "Unknown Module";
}
