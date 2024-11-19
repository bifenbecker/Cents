#!/bin/bash

set -euxo pipefail

DOMAIN=$1

check_distributions () {
distributions=$(aws resourcegroupstaggingapi get-resources --tag-filters Key=domain,Values=$DOMAIN --resource-type-filters 'cloudfront' --tags-per-page 100 --region us-east-1)
Resources=$(echo $distributions | jq -r '.ResourceTagMappingList[] | "\(.ResourceARN) \(.Tags | map(select([ .Key == "part" ] | any).Value))"')

IFS='
'
count=0

for Resource in $Resources
do
    ResourceARN=$(echo $Resource | awk '{print $1}')
    ResourcePart=$(echo $Resource | awk '{print $2}' | jq -r .[])
    ResourceID=$(echo $ResourceARN | awk -F "/" '{print $NF}')
    aliasesCount=$(aws cloudfront get-distribution --id $ResourceID | jq '.Distribution.AliasICPRecordals | length')
    echo "Cloudfront distribution $ResourcePart with ID $ResourceID has $aliasesCount alias count"
    cloudfronts[$count,1]=$aliasesCount
    cloudfronts[$count,2]=$ResourceID
    cloudfronts[$count,3]=$ResourcePart
    count=$((count+1))
done
}

declare -A cloudfronts
check_distributions

if [ ${cloudfronts[0,1]} -eq 1 ] && [ ${cloudfronts[1,1]} -eq 1 ]
then
    echo "
Both cloudfront deployments has only one CNAME
If it is a new install consider to assign first one manually"
exit 1

else
    for((i=0;i<2;i++));
    do
        if [ ${cloudfronts[$i,1]} -eq 1 ]
        then
            echo "Switching CNAME to the cloudfront distribution ${cloudfronts[$i,3]} with ID ${cloudfronts[$i,2]}"
            aws cloudfront associate-alias --alias $DOMAIN --target-distribution-id ${cloudfronts[$i,2]}
        fi
    done

fi
