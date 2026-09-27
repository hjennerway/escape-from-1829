export function storeVersion(version) {
  const parts = String(version).split('.');
  if (parts.length !== 3 || parts.some(part => !/^\d+$/.test(part) || Number(part) > 65535) || Number(parts[0]) === 0) {
    throw new Error('Use a numeric major.minor.patch version with major > 0 and components <= 65535.');
  }
  return parts.map(Number).join('.') + '.0';
}

export const previewIdentity = {
  identityName: 'EscapeFrom1829.LocalPreview',
  publisher: 'CN=EscapeFrom1829.LocalPreview',
  publisherDisplayName: 'Local development preview',
};

export function validateIdentity(identity, { preview = false } = {}) {
  for (const key of ['identityName', 'publisher', 'publisherDisplayName']) {
    if (typeof identity?.[key] !== 'string' || !identity[key].trim() || /COPY_|[\r\n\x00-\x1f]/.test(identity[key])) {
      throw new Error(`Missing or placeholder Store ${key}. Copy the exact value from Partner Center.`);
    }
  }
  if (!/^[A-Za-z0-9.-]{3,50}$/.test(identity.identityName)) throw new Error('Invalid Store identityName.');
  if (!identity.publisher.startsWith('CN=')) throw new Error('Store publisher must be the full CN= identity from Partner Center.');
  if (!preview && Object.values(identity).some(value => String(value).includes('LocalPreview'))) {
    throw new Error('A local preview identity cannot be submitted to the Store.');
  }
  return identity;
}

function xml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
}

export function createManifest(identity, version, { preview = false } = {}) {
  validateIdentity(identity, { preview });
  const name = preview ? 'Escape from 1829 (Preview)' : 'Escape from 1829';
  return `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
 xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
 xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
 IgnorableNamespaces="uap rescap">
 <Identity Name="${xml(identity.identityName)}" Publisher="${xml(identity.publisher)}" Version="${storeVersion(version)}" ProcessorArchitecture="x64" />
 <Properties>
  <DisplayName>${name}</DisplayName>
  <PublisherDisplayName>${xml(identity.publisherDisplayName)}</PublisherDisplayName>
  <Description>Explore the historic West Cheshire Hospital and escape the 1829 building.</Description>
  <Logo>Assets\\StoreLogo.png</Logo>
 </Properties>
 <Dependencies><TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.19041.0" MaxVersionTested="10.0.26100.0" /></Dependencies>
 <Resources><Resource Language="en-GB" /></Resources>
 <Applications>
  <Application Id="EscapeFrom1829" Executable="EscapeFrom1829.exe" EntryPoint="Windows.FullTrustApplication">
   <uap:VisualElements DisplayName="${name}" Description="Explore the historic West Cheshire Hospital and escape the 1829 building."
    BackgroundColor="#17251e" Square150x150Logo="Assets\\Square150x150Logo.png" Square44x44Logo="Assets\\Square44x44Logo.png">
    <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" />
   </uap:VisualElements>
  </Application>
 </Applications>
 <Capabilities><rescap:Capability Name="runFullTrust" /></Capabilities>
</Package>
`;
}
