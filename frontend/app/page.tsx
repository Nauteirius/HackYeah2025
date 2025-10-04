"use client";

import { Button, Textarea } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";

export default function Home() {
  return (
    <section className="flex flex-row h-full w-full gap-4 p-5">
      <div style={{ width: "100%" }}>
        <Textarea
          fullWidth
          disableAutosize
          className="w-full h-full 123123"
          classNames={{
            inputWrapper: "!h-full",
            input: "!h-full"
          }}
          label="Page Content"
          placeholder="Enter your description"
        />
      </div>
      <div
        style={{
          width: 500,
          display: "flex",
          flexDirection: "column",
        }}
        className="gap-3"
      >
        <Card style={{ flex: 1 }}>
          <CardBody>
            <p>Results here.</p>
          </CardBody>
        </Card>
        <Button>Analyze</Button>
      </div>
    </section>
  );
}
