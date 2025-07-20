// app/testeContrato/page.tsx
import { TonClient } from "@ton/ton";                   // TonClient vem de @ton/ton :contentReference[oaicite:0]{index=0}
import { Address }   from "@ton/core";                  // Address vem de @ton/core :contentReference[oaicite:1]{index=1}
import { FeePayment } from "@/contracts/build/FeePayment_FeePayment";
import { ConnectWallet } from "./ConnectWallet";

export const revalidate = 0;  // desabilita cache para sempre buscar valores “ao vivo”

export default async function Page() {
  // 1) Cria o client apontando para o RPC da testnet
  const endpoint = `${process.env.RPC_ENDPOINT}?api_key=${process.env.TONCENTER_API_KEY}`;
    const client = new TonClient({ endpoint });
  // 2) Parse do endereço do contrato (colocado em .env.local → NEXT_PUBLIC_CONTRACT_ADDRESS)
  const address = Address.parse(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!);

  // 3) Abre o wrapper e “injeta” o provider nele
  const contract = client.open(FeePayment.fromAddress(address));

  // 4) Chama os getters “gratuitos”
  const numerator   = await contract.getGetFeeNumerator();
  const denominator = await contract.getGetFeeDenominator();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de FeePayment</h1>
      <ConnectWallet />
      <p><strong>Numerador:</strong> {numerator.toString()}</p>
      <p><strong>Denominador:</strong> {denominator.toString()}</p>
    </main>
  );
}
