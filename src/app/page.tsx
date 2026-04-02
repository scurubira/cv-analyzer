import { getProviders } from "./api/models/providers";
import HomeClient from "./HomeClient";

export default async function Page() {
  const providers = await getProviders();
  return <HomeClient providers={providers} />;
}
