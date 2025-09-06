import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-8 animate-fade-in" data-testid="disclaimer-banner">
      <div className="flex items-start space-x-3">
        <Info className="text-primary text-xl mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-2">⚠️ AVISO IMPORTANTE - Leia antes de usar</h3>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• <strong>NÃO VENDEMOS</strong> nem fornecemos listas IPTV - este é apenas um player</li>
            <li>• Você deve <strong>COMPRAR</strong> sua própria assinatura Xtream Codes de um provedor</li>
            <li>• Entre em contato com seu provedor IPTV para obter credenciais válidas</li>
            <li>• Não hospedamos, criamos ou distribuímos qualquer conteúdo de mídia</li>
            <li>• Não nos responsabilizamos pela qualidade ou legalidade do conteúdo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
