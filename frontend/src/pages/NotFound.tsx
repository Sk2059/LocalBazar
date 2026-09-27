import {
  ArrowLeft,
  Leaf,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import Container from "../components/common/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[65vh] items-center py-20">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          
          <div className="grid size-16 place-items-center rounded-2xl bg-forest-100 text-forest-700">
            <Leaf size={28} />
          </div>

          <span className="mt-8 font-display text-7xl font-semibold text-harvest-500 sm:text-8xl">
            404
          </span>

          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Looks like this path is off the trail.
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted">
            The page you're looking for doesn't exist
            or may have moved somewhere else.
          </p>

          <Link to="/" className="mt-7">
            <Button>
              <ArrowLeft size={17} />
              Back to Koshi Bazaar
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}