"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar } from "@heroui/react";
import { LoremIpsum } from "lorem-ipsum";

type Props = {};

const lorem = new LoremIpsum();

const CardMock = (props: Props) => {
  const data = Array.apply(
    null,
    Array(Math.round((Math.random() * 10) % 2) + 1)
  ).map(() => lorem.generateParagraphs(1));

  return (
    <Card className="">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar
            isBordered
            radius="full"
            size="md"
            src="https://heroui.com/avatars/avatar-1.png"
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">
              Zoey Lang
            </h4>
            <h5 className="text-small tracking-tight text-default-400">
              @zoeylang
            </h5>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        {data.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">4</p>
          <p className=" text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">97.1K</p>
          <p className="text-default-400 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardMock;
