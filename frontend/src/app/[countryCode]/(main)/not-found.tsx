import { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page demandée n'existe pas.",
};

export default function NotFound() {
  return (
    <div className="content-container flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <h1 className="text-3xl font-bold text-gris-fonce">Page introuvable</h1>
      <p className="text-gris-moyen">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-rounded bg-turquoise text-white hover:bg-turquoise-hover transition-colors"
      >
        Retour à l&apos;accueil
        <FaArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}
