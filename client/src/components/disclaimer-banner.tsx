import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-8 animate-fade-in" data-testid="disclaimer-banner">
      <div className="flex items-start space-x-3">
        <Info className="text-primary text-xl mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-2">Importante - Leia antes de usar</h3>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• Este é apenas um player de streaming - não fornecemos conteúdo</li>
            <li>• Você precisa de uma assinatura Xtream Codes válida</li>
            <li>• Entre em contato com seu provedor IPTV para obter credenciais</li>
            <li>• Não nos responsabilizamos pela qualidade ou legalidade do conteúdo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
